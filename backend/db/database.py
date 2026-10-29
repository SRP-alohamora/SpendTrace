import os
import re
import json
import uuid
import sqlite3
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
from backend.config import DB_PATH

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
POSTGRES_SCHEMA_PATH = Path(__file__).resolve().parent / "postgres_schema.sql"

DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000001"
DEMO_MEMBER_ID = "00000000-0000-0000-0000-000000000002"

class PostgresCursorWrapper:
    """Wraps a psycopg2 RealDictCursor to support SQLite-style '?' placeholders."""
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query: str, params: Union[tuple, list] = ()):
        adapted_query = re.sub(r'\?', '%s', query)
        return self._cursor.execute(adapted_query, params)

    def executemany(self, query: str, seq_of_params):
        adapted_query = re.sub(r'\?', '%s', query)
        return self._cursor.executemany(adapted_query, seq_of_params)

    def fetchone(self):
        row = self._cursor.fetchone()
        return dict(row) if row else None

    def fetchall(self):
        rows = self._cursor.fetchall()
        return [dict(r) for r in rows] if rows else []

    def __iter__(self):
        return iter(self.fetchall())

    def __getattr__(self, name):
        return getattr(self._cursor, name)

class PostgresConnectionWrapper:
    """Wraps a psycopg2 connection to expose a standard API compatible with sqlite3."""
    def __init__(self, conn):
        self._conn = conn

    def cursor(self):
        import psycopg2.extras
        cur = self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        return PostgresCursorWrapper(cur)

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        return self._conn.close()

    def executescript(self, script: str):
        with self._conn.cursor() as cur:
            cur.execute(script)
        self._conn.commit()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()
        self.close()

def is_postgres_configured() -> bool:
    url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("SUPABASE_DB_URL")
    return bool(url and url.startswith(("postgres://", "postgresql://")))

def get_db_connection(readonly: bool = False):
    """
    Returns an active database connection.
    If DATABASE_URL or POSTGRES_URL or SUPABASE_DB_URL is set, connects to PostgreSQL.
    Otherwise, gracefully falls back to multi-tenant SQLite with WAL mode.
    """
    postgres_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or os.getenv("SUPABASE_DB_URL")
    if postgres_url and postgres_url.startswith(("postgres://", "postgresql://")):
        try:
            import psycopg2
            conn = psycopg2.connect(postgres_url)
            return PostgresConnectionWrapper(conn)
        except Exception as e:
            print(f"[SpendTrace DB Warning] PostgreSQL connection to {postgres_url[:20]}... failed: {e}. Falling back to SQLite.")

    # SQLite connection with WAL mode and 30s busy timeout
    conn = sqlite3.connect(str(DB_PATH), timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout = 30000;")
    if readonly:
        conn.execute("PRAGMA query_only = ON;")
    else:
        conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(seed_sample_data: bool = True):
    """Initializes schema and provisions users and seed demo state."""
    conn = get_db_connection()
    is_pg = is_postgres_configured()
    if not is_pg:
        conn.execute("PRAGMA journal_mode = WAL;")

    schema_file = POSTGRES_SCHEMA_PATH if is_pg else SCHEMA_PATH
    with open(schema_file, "r") as f:
        schema_sql = f.read()

    try:
        conn.executescript(schema_sql)
        conn.commit()
    except Exception as e:
        # If executescript fails due to existing tables or syntax, try cursor execute
        try:
            cur = conn.cursor()
            cur.execute(schema_sql)
            conn.commit()
        except Exception as e2:
            print(f"[SpendTrace DB Init] Schema load note: {e2}")

    # Ensure email_verified column exists
    try:
        conn.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;")
        conn.commit()
    except Exception:
        pass

    # Ensure trace_spans has sender_agent and authorized_by
    try:
        conn.execute("ALTER TABLE trace_spans ADD COLUMN sender_agent TEXT;")
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute("ALTER TABLE trace_spans ADD COLUMN authorized_by TEXT;")
        conn.commit()
    except Exception:
        pass

    # Ensure refund_audit_logs table exists
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS refund_audit_logs (
                id TEXT PRIMARY KEY,
                claim_code TEXT NOT NULL,
                trace_id TEXT NOT NULL,
                user_id TEXT,
                merchant_name TEXT NOT NULL,
                step_number INTEGER NOT NULL,
                step_title TEXT NOT NULL,
                sender_agent TEXT NOT NULL,
                authorized_by TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                channel TEXT NOT NULL,
                verification_status TEXT NOT NULL,
                input_contract_json TEXT NOT NULL,
                output_contract_json TEXT NOT NULL,
                message_excerpt TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
    except Exception:
        pass

    # Seed Default Users (Admin, Clean New User, Guest)
    seed_users(conn)

    # Seed Demo Transactions strictly for DEMO_ADMIN_ID
    if seed_sample_data:
        seed_admin_demo_data(conn)

    conn.close()

def seed_users(conn):
    """Provisions default demo admin, clean member, guest, and test users."""
    from backend.auth.supabase_auth import hash_password
    from backend.config import get_admin_password
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE id = ?", (DEMO_ADMIN_ID,))
    if not cur.fetchone():
        # 1. Demo Admin (for evals & observability & rich ledger preview)
        cur.execute(
            """INSERT INTO users (id, email, password_hash, role, full_name, email_verified, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (DEMO_ADMIN_ID, "admin@spendtrace.ai", hash_password(get_admin_password()), "admin", "Admin User", 1, datetime.utcnow().isoformat())
        )
    
    cur.execute("SELECT id FROM users WHERE id = ?", (DEMO_MEMBER_ID,))
    if not cur.fetchone():
        # 2. Clean New User (Starts with 0 transactions, 0 receipts, 0 refunds)
        cur.execute(
            """INSERT INTO users (id, email, password_hash, role, full_name, email_verified, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (DEMO_MEMBER_ID, "newuser@spendtrace.ai", hash_password("userpassword123"), "member", "New User", 1, datetime.utcnow().isoformat())
        )
    
    # 3. Seeded user shivani
    cur.execute("SELECT id FROM users WHERE email = ? OR email LIKE ?", ("shivani@spendtrace.ai", "shivani@%"))
    if not cur.fetchone():
        cur.execute(
            """INSERT INTO users (id, email, password_hash, role, full_name, email_verified, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            ("00000000-0000-0000-0000-000000000003", "shivani@spendtrace.ai", hash_password("Password123!@#"), "member", "Shivani", 1, datetime.utcnow().isoformat())
        )

    # 4. Guest User (Exempt from MFA, clean slate)
    cur.execute("SELECT id FROM users WHERE email = ? OR role = 'guest'", ("guest@spendtrace.ai",))
    if not cur.fetchone():
        cur.execute(
            """INSERT INTO users (id, email, password_hash, role, full_name, email_verified, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            ("00000000-0000-0000-0000-000000000004", "guest@spendtrace.ai", hash_password("GuestPass2026!"), "guest", "Guest User", 1, datetime.utcnow().isoformat())
        )
    conn.commit()

def seed_admin_demo_data(conn):
    """Seeds sample data strictly associated with DEMO_ADMIN_ID."""
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as count FROM accounts WHERE user_id = ?", (DEMO_ADMIN_ID,))
    row = cur.fetchone()
    count = row["count"] if row else 0
    if count > 0:
        try:
            today = date.today()
            cur.execute("UPDATE transactions SET date = ?, posted_date = ? WHERE user_id = ? AND merchant_clean = 'Blue Bottle Coffee' AND source = 'manual_chat'",
                        (str(today - timedelta(days=1)), str(today - timedelta(days=1)), DEMO_ADMIN_ID))
            conn.commit()
        except Exception as lock_err:
            pass
        return

    # Default accounts for demo admin
    accounts = [
        ("acc_chase", DEMO_ADMIN_ID, "Chase Sapphire Reserve", "credit", "4412", "USD"),
        ("acc_bofa", DEMO_ADMIN_ID, "BofA Joint Checking", "checking", "8821", "USD"),
        ("acc_apple", DEMO_ADMIN_ID, "Apple Card", "credit", "1094", "USD")
    ]
    cur.executemany(
        "INSERT INTO accounts (id, user_id, name, account_type, last_four, currency) VALUES (?, ?, ?, ?, ?, ?)",
        accounts
    )

    # Initial realistic transactions
    today = date.today()
    sample_txs = [
        # September benchmark (Previous month)
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_chase", str(today - timedelta(days=35)), str(today - timedelta(days=35)),
         "TRADER JOES #102 SAN FRAN", "Trader Joe's", 65.40, "Groceries", "csv_statement", "verified", 0, None, None, "Weekly groceries"),
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_chase", str(today - timedelta(days=32)), str(today - timedelta(days=32)),
         "SQ *BLUE BOTTLE COFFEE", "Blue Bottle Coffee", 5.50, "Dining", "csv_statement", "verified", 0, None, None, "Coffee"),
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_chase", str(today - timedelta(days=30)), str(today - timedelta(days=30)),
         "NOBU RESTAURANT PALO ALTO", "Nobu", 145.00, "Dining", "csv_statement", "verified", 0, None, None, "Dinner"),
        
        # October transactions (Current month)
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_chase", str(today - timedelta(days=12)), str(today - timedelta(days=12)),
         "NOBU RESTAURANT PALO ALTO", "Nobu", 145.00, "Dining", "csv_statement", "verified", 0, None, None, "Weekend dinner"),
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_chase", str(today - timedelta(days=8)), str(today - timedelta(days=8)),
         "OSTERIA DEL CIRCO SF", "Osteria", 68.50, "Dining", "csv_statement", "verified", 0, None, None, "Italian dinner"),
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_apple", str(today - timedelta(days=5)), str(today - timedelta(days=5)),
         "BLUE RIBBON BRASSERIE", "Blue Ribbon", 48.00, "Dining", "csv_statement", "verified", 0, None, None, "Dinner with friend"),
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_bofa", str(today - timedelta(days=3)), str(today - timedelta(days=3)),
         "TARGET STORE T-112", "Target", 42.18, "Shopping", "csv_statement", "verified", 0, None, None, "Household supplies"),
        (str(uuid.uuid4()), DEMO_ADMIN_ID, "acc_chase", str(today - timedelta(days=2)), str(today - timedelta(days=2)),
         "BLUE BOTTLE COFFEE", "Blue Bottle Coffee", 5.50, "Dining", "manual_chat", "verified", 0, None, None, "Morning espresso"),
    ]
    cur.executemany(
        """INSERT INTO transactions 
           (id, user_id, account_id, date, posted_date, merchant_raw, merchant_clean, amount, category, source, status, is_return, receipt_id, matched_transaction_id, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        sample_txs
    )

    # Seed an overdue return slip for Refund Radar
    return_date = today - timedelta(days=14)
    deadline_date = return_date + timedelta(days=10)
    return_receipt_id = str(uuid.uuid4())
    cur.execute(
        """INSERT INTO receipts 
           (id, user_id, merchant_name, receipt_date, subtotal, tax, tip, total_amount, confidence_score, is_return_slip)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (return_receipt_id, DEMO_ADMIN_ID, "Zara", str(return_date), 89.00, 0.0, 0.0, 89.00, 0.98, 1)
    )
    cur.execute(
        """INSERT INTO return_reconciliations 
           (id, user_id, return_receipt_id, merchant_name, expected_amount, credited_amount, status, return_date, deadline_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (str(uuid.uuid4()), DEMO_ADMIN_ID, return_receipt_id, "Zara", 89.00, None, "overdue_alert", str(return_date), str(deadline_date))
    )

    conn.commit()

def execute_safe_readonly_sql(sql_query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Executes a SQL query in a strictly sandboxed, read-only session."""
    forbidden = ["insert", "update", "delete", "drop", "alter", "create", "replace", "truncate"]
    first_word = sql_query.strip().split()[0].lower() if sql_query.strip() else ""
    if first_word in forbidden or any(re.search(rf"\b{re.escape(w)}\b", sql_query, re.IGNORECASE) for w in ["drop", "delete from", "truncate", "insert into", "update"]):
        raise PermissionError(f"Security violation: Only SELECT queries are permitted. Attempted: {first_word.upper()}")

    conn = get_db_connection(readonly=True)
    try:
        cur = conn.cursor()
        cur.execute(sql_query, params)
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_ledger_transactions(user_id: Optional[str] = None, limit: int = 100, category: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns ledger transactions for the given user_id.
    FOR A NEW USER: returns 0 items (clean slate).
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        if user_id and category:
            cur.execute(
                "SELECT * FROM transactions WHERE user_id = ? AND category = ? ORDER BY date DESC LIMIT ?",
                (user_id, category, limit)
            )
        elif user_id:
            cur.execute(
                "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT ?",
                (user_id, limit)
            )
        elif category:
            cur.execute(
                "SELECT * FROM transactions WHERE category = ? ORDER BY date DESC LIMIT ?",
                (category, limit)
            )
        else:
            cur.execute(
                "SELECT * FROM transactions ORDER BY date DESC LIMIT ?",
                (limit,)
            )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()

def get_refund_radar_items(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns return reconciliations for Refund Radar.
    FOR A NEW USER: returns 0 items.
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        if user_id:
            cur.execute("SELECT * FROM return_reconciliations WHERE user_id = ? ORDER BY return_date DESC", (user_id,))
        else:
            cur.execute("SELECT * FROM return_reconciliations ORDER BY return_date DESC")
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()

def get_clarification_queue(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        if user_id:
            cur.execute("SELECT * FROM clarification_queue WHERE user_id = ? AND resolved = 0 ORDER BY created_at DESC", (user_id,))
        else:
            cur.execute("SELECT * FROM clarification_queue WHERE resolved = 0 ORDER BY created_at DESC")
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()

def seed_sample_data_for_user(user_id: str):
    """Allows a new user to optionally populate their account with demo data."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        acc_id = f"acc_{uuid.uuid4().hex[:6]}"
        cur.execute(
            "INSERT INTO accounts (id, user_id, name, account_type, last_four, currency) VALUES (?, ?, ?, ?, ?, ?)",
            (acc_id, user_id, "Sample Credit Card", "credit", "7712", "USD")
        )
        today = date.today()
        cur.execute(
            """INSERT INTO transactions 
               (id, user_id, account_id, date, posted_date, merchant_raw, merchant_clean, amount, category, source, status, is_return, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (str(uuid.uuid4()), user_id, acc_id, str(today - timedelta(days=2)), str(today - timedelta(days=2)),
             "SAMPLE GROCERY STORE", "Sample Groceries", 54.20, "Groceries", "csv_statement", "verified", 0, "Demo transaction")
        )
        conn.commit()
    finally:
        conn.close()

def clear_user_data(user_id: str):
    """Resets a user's ledger back to a completely clean slate."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM receipts WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM return_reconciliations WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM clarification_queue WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM accounts WHERE user_id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()

def insert_refund_audit_log(
    claim_code: str,
    trace_id: str,
    merchant_name: str,
    step_number: int,
    step_title: str,
    sender_agent: str,
    authorized_by: str,
    timestamp: str,
    channel: str,
    verification_status: str,
    input_contract_json: str,
    output_contract_json: str,
    message_excerpt: str,
    user_id: Optional[str] = None
) -> str:
    """Persists an auditable refund message exchange with contract and authorization details."""
    audit_id = f"aud_{uuid.uuid4().hex[:10]}"
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO refund_audit_logs
               (id, claim_code, trace_id, user_id, merchant_name, step_number, step_title, sender_agent, authorized_by, timestamp, channel, verification_status, input_contract_json, output_contract_json, message_excerpt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (audit_id, claim_code, trace_id, user_id, merchant_name, step_number, step_title,
             sender_agent, authorized_by, timestamp, channel, verification_status,
             input_contract_json, output_contract_json, message_excerpt)
        )
        conn.commit()
        return audit_id
    finally:
        conn.close()

def get_refund_audit_logs(claim_code: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all tracked refund message exchanges for a claim or user."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        if claim_code:
            cur.execute(
                "SELECT * FROM refund_audit_logs WHERE claim_code = ? ORDER BY step_number ASC, created_at ASC",
                (claim_code,)
            )
        elif user_id:
            cur.execute(
                "SELECT * FROM refund_audit_logs WHERE user_id = ? ORDER BY created_at DESC",
                (user_id,)
            )
        else:
            cur.execute("SELECT * FROM refund_audit_logs ORDER BY created_at DESC LIMIT 100")
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()

if __name__ == "__main__":
    init_db(seed_sample_data=True)
    print("Database initialized successfully at:", DB_PATH)

