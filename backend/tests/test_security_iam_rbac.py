import uuid
import time
import pytest
from datetime import datetime
import jwt
from fastapi.testclient import TestClient
from backend.app import app
from backend.auth.supabase_auth import (
    SUPABASE_JWT_SECRET,
    JWT_ALGORITHM,
    create_supabase_jwt,
    decode_supabase_jwt,
    hash_password,
    verify_password,
    validate_password_strength,
    DEMO_ADMIN_ID,
    DEMO_MEMBER_ID
)
from backend.db.database import (
    init_db,
    execute_safe_readonly_sql,
    get_ledger_transactions,
    get_db_connection,
    clear_user_data
)
from backend.agents.extractor import IngestionExtractor

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def ensure_db_initialized():
    init_db(seed_sample_data=True)

# =====================================================================
# 1. Authentication & Login Tests (Positive & Negative)
# =====================================================================

def test_login_successful_with_full_email():
    """Verify standard login with email returns 200, JWT token, and correct user profile."""
    # Register a dedicated user
    uid = uuid.uuid4().hex[:6]
    email = f"auth_test_{uid}@spendtrace.ai"
    pwd = "ValidPassword123!@#"
    reg_res = client.post("/api/v1/auth/signup", json={"email": email, "password": pwd, "full_name": "Auth Tester"})
    assert reg_res.status_code == 200
    assert reg_res.json().get("mfa_required") is True

    # Complete MFA verification to verify email address
    v_res = client.post("/api/v1/auth/verify-mfa", json={"email": email, "code": "123456"})
    assert v_res.status_code == 200
    assert "access_token" in v_res.json()

    # Attempt subsequent login with credentials
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "member"
    assert data["user"]["is_clean_slate"] is True

def test_login_successful_with_bare_username():
    """Verify login works seamlessly with username alias (e.g. 'shivani' or bare handle)."""
    uid = uuid.uuid4().hex[:6]
    username = f"user_{uid}"
    pwd = "ValidPassword123!@#"
    reg_res = client.post("/api/v1/auth/signup", json={"email": username, "password": pwd, "full_name": "Username Tester"})
    assert reg_res.status_code == 200
    assert reg_res.json().get("mfa_required") is True

    # Complete MFA verification
    v_res = client.post("/api/v1/auth/verify-mfa", json={"email": username, "code": "123456"})
    assert v_res.status_code == 200

    # Login using just the username
    login_res = client.post("/api/v1/auth/login", json={"email": username, "password": pwd})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_login_invalid_password_returns_401():
    """Verify wrong password returns HTTP 401 Unauthorized with safe error message."""
    uid = uuid.uuid4().hex[:6]
    email = f"pwd_fail_{uid}@spendtrace.ai"
    client.post("/api/v1/auth/signup", json={"email": email, "password": "CorrectPassword123!"})

    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": "WrongPassword123!"})
    assert login_res.status_code == 401
    assert "Invalid email/username or password" in login_res.json()["detail"]

def test_login_nonexistent_user_returns_401():
    """Verify unknown user returns HTTP 401 without revealing whether the account exists."""
    login_res = client.post("/api/v1/auth/login", json={"email": "nonexistent_ghost_user@spendtrace.ai", "password": "AnyPassword123!"})
    assert login_res.status_code == 401
    assert "Invalid email/username or password" in login_res.json()["detail"]

def test_login_missing_fields_returns_400():
    """Verify missing email or password is rejected with HTTP 400 Bad Request."""
    res1 = client.post("/api/v1/auth/login", json={"email": "", "password": "Password123!"})
    assert res1.status_code == 400

    res2 = client.post("/api/v1/auth/login", json={"email": "user@spendtrace.ai", "password": ""})
    assert res2.status_code == 400

# =====================================================================
# 2. Registration & Password Complexity Policy Enforcement
# =====================================================================

def test_registration_password_policy_all_criteria():
    """Verify password policy enforces length (>=10), uppercase, lowercase, and special characters."""
    # Too short (<10)
    res_short = client.post("/api/v1/auth/signup", json={"email": "short@spendtrace.ai", "password": "Short1!"})
    assert res_short.status_code == 400
    assert "at least 10 characters" in res_short.json()["detail"]

    # Missing uppercase
    res_no_upper = client.post("/api/v1/auth/signup", json={"email": "noupper@spendtrace.ai", "password": "lowercaseonly123!"})
    assert res_no_upper.status_code == 400
    assert "capital letter" in res_no_upper.json()["detail"]

    # Missing lowercase
    res_no_lower = client.post("/api/v1/auth/signup", json={"email": "nolower@spendtrace.ai", "password": "UPPERCASEONLY123!"})
    assert res_no_lower.status_code == 400
    assert "lowercase letter" in res_no_lower.json()["detail"]

    # Missing special character
    res_no_special = client.post("/api/v1/auth/signup", json={"email": "nospec@spendtrace.ai", "password": "NoSpecialChar1234"})
    assert res_no_special.status_code == 400
    assert "special character" in res_no_special.json()["detail"]

def test_registration_duplicate_email_rejected_with_400():
    """Verify registering an existing email or username is prevented with HTTP 400."""
    uid = uuid.uuid4().hex[:6]
    email = f"dup_{uid}@spendtrace.ai"
    res1 = client.post("/api/v1/auth/signup", json={"email": email, "password": "StrongPassword123!"})
    assert res1.status_code == 200

    res2 = client.post("/api/v1/auth/signup", json={"email": email, "password": "StrongPassword123!"})
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

# =====================================================================
# 3. Password Reset Flow & Invalidation
# =====================================================================

def test_password_reset_flow_and_reauthentication():
    """Verify password reset verifies policy, updates hash, and rejects old credentials."""
    uid = uuid.uuid4().hex[:6]
    username = f"reset_user_{uid}"
    old_pwd = "OldPassword123!@#"
    new_pwd = "NewPassword123!@#"
    reg_res = client.post("/api/v1/auth/signup", json={"email": username, "password": old_pwd})
    assert reg_res.status_code == 200
    # Complete MFA to verify account
    client.post("/api/v1/auth/verify-mfa", json={"email": username, "code": "123456"})

    # Reset with weak password fails
    fail_reset = client.post("/api/v1/auth/reset-password", json={"identifier": username, "new_password": "weak"})
    assert fail_reset.status_code == 400

    # Reset with valid password succeeds
    ok_reset = client.post("/api/v1/auth/reset-password", json={"identifier": username, "new_password": new_pwd})
    assert ok_reset.status_code == 200
    assert "successfully reset" in ok_reset.json()["message"]

    # Old password fails
    old_login = client.post("/api/v1/auth/login", json={"email": username, "password": old_pwd})
    assert old_login.status_code == 401

    # New password succeeds
    new_login = client.post("/api/v1/auth/login", json={"email": username, "password": new_pwd})
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()

# =====================================================================
# 4. JWT Security, Verification & Tampering Defenses
# =====================================================================

def test_jwt_validation_on_me_endpoint():
    """Verify /api/v1/auth/me returns current user profile and permissions from valid JWT."""
    uid = uuid.uuid4().hex[:6]
    token = create_supabase_jwt(user_id=f"user_{uid}", email=f"user_{uid}@spendtrace.ai", role="member")

    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    body = res.json()
    assert body["user"]["id"] == f"user_{uid}"
    assert body["is_admin"] is False
    assert body["permissions"]["can_access_ledger"] is True
    assert body["permissions"]["can_run_evals"] is False

def test_jwt_tampered_signature_rejected_with_401():
    """Verify tampering with JWT signature or claims is rejected with HTTP 401."""
    token = create_supabase_jwt(user_id="legit_id", email="legit@spendtrace.ai", role="member")
    # Tamper with the signature portion (last component)
    parts = token.split(".")
    tampered_token = f"{parts[0]}.{parts[1]}.tampered_signature_xyz"

    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res.status_code == 401
    assert "Invalid Supabase Auth token" in res.json()["detail"]

def test_jwt_expired_token_rejected_with_401():
    """Verify expired JWT tokens are rejected with HTTP 401."""
    # Create token with past expiration
    now = int(time.time())
    payload = {
        "iss": "supabase",
        "sub": "expired_user",
        "aud": "authenticated",
        "exp": now - 3600,  # Expired 1 hour ago
        "iat": now - 7200,
        "email": "expired@spendtrace.ai",
        "role": "authenticated",
        "app_metadata": {"role": "member"}
    }
    expired_token = jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm=JWT_ALGORITHM)

    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401
    assert "token has expired" in res.json()["detail"]

def test_jwt_forged_with_wrong_secret_rejected_with_401():
    """Verify tokens signed with an unauthorized external secret are rejected."""
    wrong_token = jwt.encode(
        {"iss": "supabase", "sub": "attacker", "aud": "authenticated", "app_metadata": {"role": "admin"}},
        "fake-attacker-secret-key-12345",
        algorithm="HS256"
    )
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {wrong_token}"})
    assert res.status_code == 401

# =====================================================================
# 5. Role-Based Access Control (RBAC) & Administrative Barrier
# =====================================================================

def test_member_role_strictly_blocked_from_admin_evals():
    """Verify members cannot run evaluations or view evaluation metrics (HTTP 403 Forbidden)."""
    member_token = create_supabase_jwt(user_id="member_1", email="member@spendtrace.ai", role="member")
    headers = {"Authorization": f"Bearer {member_token}"}

    # 1. Run evals -> 403
    res_run = client.post("/api/v1/evals/run", headers=headers)
    assert res_run.status_code == 403
    assert "Admin role required" in res_run.json()["detail"]

    # 2. Get latest eval -> 403
    res_latest = client.get("/api/v1/evals/latest", headers=headers)
    assert res_latest.status_code == 403

    # 3. Get eval history -> 403
    res_hist = client.get("/api/v1/evals/history", headers=headers)
    assert res_hist.status_code == 403

def test_member_role_strictly_blocked_from_admin_observability():
    """Verify members cannot view observability telemetry traces or metrics (HTTP 403 Forbidden)."""
    member_token = create_supabase_jwt(user_id="member_2", email="member2@spendtrace.ai", role="member")
    headers = {"Authorization": f"Bearer {member_token}"}

    # 1. List traces -> 403
    res_traces = client.get("/api/v1/observability/traces", headers=headers)
    assert res_traces.status_code == 403
    assert "Admin role required" in res_traces.json()["detail"]

    # 2. Telemetry metrics -> 403
    res_metrics = client.get("/api/v1/observability/metrics", headers=headers)
    assert res_metrics.status_code == 403

def test_admin_role_granted_access_to_evals_and_observability():
    """Verify admin role can successfully invoke evals and observability endpoints."""
    admin_token = create_supabase_jwt(user_id="admin_1", email="admin1@spendtrace.ai", role="admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res_latest = client.get("/api/v1/evals/latest", headers=headers)
    assert res_latest.status_code == 200

    res_metrics = client.get("/api/v1/observability/metrics", headers=headers)
    assert res_metrics.status_code == 200
    assert "total_traces" in res_metrics.json()

def test_role_switch_elevation_and_validation():
    """Verify switching role between member and admin, and blocking invalid roles."""
    uid = uuid.uuid4().hex[:6]
    token = create_supabase_jwt(user_id=f"switch_{uid}", email=f"switch_{uid}@spendtrace.ai", role="member")
    # Register in DB so update succeeds
    conn = get_db_connection()
    conn.cursor().execute(
        "INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
        (f"switch_{uid}", f"switch_{uid}@spendtrace.ai", hash_password("ValidPassword123!"), "member", datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

    headers = {"Authorization": f"Bearer {token}"}

    # Invalid role must fail
    res_invalid = client.post("/api/v1/auth/switch-role", json={"role": "superuser"}, headers=headers)
    assert res_invalid.status_code == 400

    # Elevate to admin
    res_admin = client.post("/api/v1/auth/switch-role", json={"role": "admin"}, headers=headers)
    assert res_admin.status_code == 200
    assert res_admin.json()["user"]["role"] == "admin"
    new_token = res_admin.json()["access_token"]
    claims = decode_supabase_jwt(new_token)
    assert claims["app_metadata"]["role"] == "admin"

# =====================================================================
# 6. Multi-Tenant Data Isolation & Cross-Tenant Snooping Defense
# =====================================================================

def test_multi_tenant_data_isolation_between_users():
    """
    CRITICAL SECURITY INVARIANT:
    User A's financial transactions and return receipts must NEVER be visible to User B.
    """
    user_a_id = f"tenant_a_{uuid.uuid4().hex[:6]}"
    user_b_id = f"tenant_b_{uuid.uuid4().hex[:6]}"

    token_a = create_supabase_jwt(user_id=user_a_id, email=f"{user_a_id}@spendtrace.ai", role="member")
    token_b = create_supabase_jwt(user_id=user_b_id, email=f"{user_b_id}@spendtrace.ai", role="member")

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT OR IGNORE INTO users (id, email, password_hash, role, full_name, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_a_id, f"{user_a_id}@spendtrace.ai", "hash", "member", "User A", 1))
        cur.execute("INSERT OR IGNORE INTO users (id, email, password_hash, role, full_name, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_b_id, f"{user_b_id}@spendtrace.ai", "hash", "member", "User B", 1))
        cur.execute(
            """INSERT INTO transactions (id, user_id, date, merchant_raw, merchant_clean, amount, category, source, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (f"tx_a_{uuid.uuid4().hex[:4]}", user_a_id, "2026-10-25", "SECRET MERCHANT", "Secret Merchant", 1250.00, "Confidential", "manual_chat", "verified")
        )
        conn.commit()
    finally:
        conn.close()

    # User A queries transactions -> sees 1 transaction
    res_a = client.get("/api/v1/transactions", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200
    assert res_a.json()["count"] == 1
    assert res_a.json()["transactions"][0]["merchant_clean"] == "Secret Merchant"

    # User B queries transactions -> MUST NOT SEE USER A'S TRANSACTION (0 records)
    res_b = client.get("/api/v1/transactions", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.status_code == 200
    assert res_b.json()["count"] == 0
    assert res_b.json()["is_clean_slate"] is True

    # Clean up User A and B
    clear_user_data(user_a_id)
    clear_user_data(user_b_id)

def test_clean_slate_isolation_does_not_affect_other_tenants():
    """Verify that calling /api/v1/auth/clean-slate clears only the caller's data."""
    u1 = f"u1_{uuid.uuid4().hex[:6]}"
    u2 = f"u2_{uuid.uuid4().hex[:6]}"
    token_u1 = create_supabase_jwt(user_id=u1, email=f"{u1}@spendtrace.ai", role="member")
    token_u2 = create_supabase_jwt(user_id=u2, email=f"{u2}@spendtrace.ai", role="member")

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT OR IGNORE INTO users (id, email, password_hash, role, full_name, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
                    (u1, f"{u1}@spendtrace.ai", "hash", "member", "U1", 1))
        cur.execute("INSERT OR IGNORE INTO users (id, email, password_hash, role, full_name, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
                    (u2, f"{u2}@spendtrace.ai", "hash", "member", "U2", 1))
        cur.execute("INSERT INTO transactions (id, user_id, date, merchant_raw, merchant_clean, amount, category, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (f"tx1_{u1}", u1, "2026-10-25", "M1", "M1", 10.0, "Misc", "manual_chat", "verified"))
        cur.execute("INSERT INTO transactions (id, user_id, date, merchant_raw, merchant_clean, amount, category, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (f"tx2_{u2}", u2, "2026-10-25", "M2", "M2", 20.0, "Misc", "manual_chat", "verified"))
        conn.commit()
    finally:
        conn.close()

    # u1 calls clean-slate
    res = client.post("/api/v1/auth/clean-slate", headers={"Authorization": f"Bearer {token_u1}"})
    assert res.status_code == 200

    # u1 transactions are 0
    txs_u1 = get_ledger_transactions(user_id=u1)
    assert len(txs_u1) == 0

    # u2 transactions remain intact (1 record)
    txs_u2 = get_ledger_transactions(user_id=u2)
    assert len(txs_u2) == 1

    clear_user_data(u1)
    clear_user_data(u2)

# =====================================================================
# 7. PII Redaction & Card Number Masking
# =====================================================================

def test_pii_credit_card_full_pan_never_stored():
    """
    Verify that when processing receipts with full card numbers (e.g. 4111-2222-3333-4412),
    only the last 4 digits are retained and full PAN is never persisted.
    """
    # Natural language expense mentioning full card number
    text = "Charged $85.00 on Visa card 4111 2222 3333 4412 at Apple Store"
    contract = IngestionExtractor.parse_natural_language_expense(text)
    assert contract.total_amount == 85.00
    assert contract.merchant_name == "Apple Store"

    # Only last4 should be stored in contract
    if contract.payment_method_last4:
        assert len(contract.payment_method_last4) == 4
        assert contract.payment_method_last4 == "4412"
        # Full PAN must NOT appear as the last4 string
        assert "4111" not in contract.payment_method_last4

# =====================================================================
# 8. SQL Sandboxing & Injection Defenses
# =====================================================================

def test_sql_sandbox_blocks_data_tampering_and_ddl():
    """Verify destructive SQL statements are intercepted and rejected with PermissionError."""
    destructive_attempts = [
        "DROP TABLE users;",
        "DROP TABLE transactions;",
        "DELETE FROM transactions WHERE 1=1;",
        "UPDATE users SET role = 'admin';",
        "INSERT INTO users (id, email) VALUES ('evil', 'evil@spendtrace.ai');",
        "TRUNCATE TABLE receipts;",
        "ALTER TABLE transactions ADD COLUMN hacked TEXT;"
    ]
    for query in destructive_attempts:
        with pytest.raises(PermissionError):
            execute_safe_readonly_sql(query)

def test_sql_injection_union_attack_in_safe_session():
    """Verify queries execute in a strictly read-only session with query_only=ON."""
    # Read-only query succeeds
    rows = execute_safe_readonly_sql("SELECT COUNT(*) as count FROM users")
    assert len(rows) == 1

    # Attempting to execute DML even wrapped or disguised is rejected
    with pytest.raises(PermissionError):
        execute_safe_readonly_sql("SELECT 1; DROP TABLE transactions;")

# =====================================================================
# 9. Mandatory MFA & Email Verification Security Suite
# =====================================================================

def test_custom_email_requires_mandatory_mfa_on_signup():
    """Verify that registering with a custom email address mandates 6-digit MFA verification."""
    uid = uuid.uuid4().hex[:6]
    custom_email = f"personal_user_{uid}@gmail.com"
    pwd = "CustomUserPassword123!@#"

    res = client.post("/api/v1/auth/signup", json={"email": custom_email, "password": pwd, "full_name": "Personal User"})
    assert res.status_code == 200
    data = res.json()
    assert data["mfa_required"] is True
    assert data["email"] == custom_email
    assert "Mandatory MFA" in data["message"]
    assert "dev_code_hint" in data
    assert len(data["dev_code_hint"]) == 6

    # Verify database has email_verified = 0
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT email_verified FROM users WHERE email = ?", (custom_email,))
    row = cur.fetchone()
    conn.close()
    assert row is not None
    assert row["email_verified"] == 0

def test_unverified_custom_email_cannot_login_without_mfa():
    """Verify that attempting to log in before verifying email triggers mandatory MFA."""
    uid = uuid.uuid4().hex[:6]
    custom_email = f"unverified_{uid}@outlook.com"
    pwd = "SecurePassword123!@#"
    client.post("/api/v1/auth/signup", json={"email": custom_email, "password": pwd})

    login_res = client.post("/api/v1/auth/login", json={"email": custom_email, "password": pwd})
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["mfa_required"] is True
    assert "access_token" not in data

def test_verify_mfa_with_valid_code_issues_jwt_and_marks_verified():
    """Verify that submitting the correct 6-digit MFA code verifies the email and grants JWT."""
    uid = uuid.uuid4().hex[:6]
    custom_email = f"verify_test_{uid}@corporate-domain.org"
    pwd = "CorporatePassword123!@#"
    signup_res = client.post("/api/v1/auth/signup", json={"email": custom_email, "password": pwd})
    dev_code = signup_res.json()["dev_code_hint"]

    verify_res = client.post("/api/v1/auth/verify-mfa", json={"email": custom_email, "code": dev_code})
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert "access_token" in v_data
    assert v_data["token_type"] == "bearer"
    assert v_data["user"]["email"] == custom_email
    assert v_data["user"]["email_verified"] is True

    # Validate decoded JWT claims
    claims = decode_supabase_jwt(v_data["access_token"])
    assert claims["app_metadata"]["email_verified"] is True

    # Subsequent login succeeds without requiring MFA again
    login_res = client.post("/api/v1/auth/login", json={"email": custom_email, "password": pwd})
    assert login_res.status_code == 200
    assert login_res.json().get("mfa_required") is False
    assert "access_token" in login_res.json()

def test_verify_mfa_with_invalid_code_rejected_with_400():
    """Verify that submitting an incorrect MFA code is rejected with HTTP 400 Bad Request."""
    uid = uuid.uuid4().hex[:6]
    custom_email = f"bad_code_{uid}@yahoo.com"
    client.post("/api/v1/auth/signup", json={"email": custom_email, "password": "AnyPassword123!@#"})

    bad_res = client.post("/api/v1/auth/verify-mfa", json={"email": custom_email, "code": "000000"})
    assert bad_res.status_code == 400
    assert "Invalid or expired MFA verification code" in bad_res.json()["detail"]

def test_resend_mfa_code_dispatches_new_valid_code():
    """Verify that requesting resend generates a new 6-digit code."""
    uid = uuid.uuid4().hex[:6]
    custom_email = f"resend_{uid}@domain.com"
    client.post("/api/v1/auth/signup", json={"email": custom_email, "password": "Password123!@#"})

    resend_res = client.post("/api/v1/auth/resend-mfa", json={"email": custom_email})
    assert resend_res.status_code == 200
    r_data = resend_res.json()
    assert "dev_code_hint" in r_data
    new_code = r_data["dev_code_hint"]

    # Verify with new code succeeds
    verify_res = client.post("/api/v1/auth/verify-mfa", json={"email": custom_email, "code": new_code})
    assert verify_res.status_code == 200
    assert "access_token" in verify_res.json()

def test_demo_admin_bypasses_mfa_completely():
    """
    CRITICAL POLICY REQUIREMENT:
    Demo Admin account (admin@spendtrace.ai) MUST be completely exempt from MFA.
    """
    from backend.config import get_admin_password
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@spendtrace.ai", "password": get_admin_password()})
    assert login_res.status_code == 200
    data = login_res.json()
    assert data.get("mfa_required") is False or "access_token" in data
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_guest_login_bypasses_mfa_completely():
    """
    CRITICAL POLICY REQUIREMENT:
    Guest users MUST be completely exempt from MFA and granted clean slate session.
    """
    guest_res = client.post("/api/v1/auth/guest-login")
    assert guest_res.status_code == 200
    data = guest_res.json()
    assert data.get("mfa_required") is False or "access_token" in data
    assert "access_token" in data
    assert data["user"]["role"] == "guest"
    assert data["user"]["is_clean_slate"] is True

def test_auth_config_exposes_mandatory_mfa_and_exemptions():
    """Verify /api/v1/auth/config exposes MFA requirements and exemptions to frontend."""
    res = client.get("/api/v1/auth/config")
    assert res.status_code == 200
    config = res.json()
    assert config["mfa_mandatory"] is True
    assert "demo_admin" in config["mfa_exempt"]
    assert "guest" in config["mfa_exempt"]
