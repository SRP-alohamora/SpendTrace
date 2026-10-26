import pytest
from datetime import date
from fastapi.testclient import TestClient
from backend.app import app
from backend.agents.extractor import IngestionExtractor
from backend.agents.reconciler import ReconciliationAgent
from backend.agents.analytics import AnalyticsQueryAgent
from backend.agents.state import ExtractionContract
from backend.db.database import init_db, execute_safe_readonly_sql, get_ledger_transactions
from backend.evals.runner import run_evaluation_suite
from backend.observability.tracer import calculate_token_cost

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db(seed_sample_data=True)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_natural_language_extraction():
    text = "Spent $24.50 at Trader Joe's today on groceries"
    contract = IngestionExtractor.parse_natural_language_expense(text)
    assert contract.merchant_name == "Trader Joe's"
    assert contract.total_amount == 24.50
    assert contract.receipt_date == str(date.today())
    assert contract.confidence_score >= 0.80

def test_csv_statement_parsing():
    sample_csv = """Transaction Date,Post Date,Description,Amount,Category
10/24/2026,10/24/2026,TARGET STORE T-112,42.18,Shopping
10/22/2026,10/22/2026,ZARA RETURN,-89.00,Apparel
"""
    records = IngestionExtractor.parse_csv_statement(sample_csv)
    assert len(records) == 2
    assert "TARGET" in records[0]["merchant_clean"]
    assert records[0]["amount"] == 42.18
    assert records[1]["is_return"] == 1
    assert records[1]["amount"] == -89.00

def test_safe_sql_sandbox():
    # Valid SELECT query must succeed
    results = execute_safe_readonly_sql("SELECT COUNT(*) as total FROM transactions")
    assert len(results) == 1
    assert results[0]["total"] > 0

    # Destructive queries must be strictly rejected
    with pytest.raises(PermissionError):
        execute_safe_readonly_sql("DROP TABLE transactions;")

    with pytest.raises(PermissionError):
        execute_safe_readonly_sql("DELETE FROM transactions WHERE 1=1;")

def test_reconciliation_duplicate_detection():
    # Attempting to log an expense matching a seeded transaction
    contract = ExtractionContract(
        merchant_name="Blue Bottle Coffee",
        receipt_date=str(date.today()),
        total_amount=5.50,
        confidence_score=0.95
    )
    result = ReconciliationAgent.reconcile_candidate(contract)
    assert result.requires_human_review is True
    assert result.relationship_type in ["duplicate_charge", "statement_match"]

def test_refund_radar_query():
    query_contract = AnalyticsQueryAgent.answer_spending_query("Which returns have had no matching refund?")
    assert len(query_contract.record_results) >= 1
    assert "Zara" in query_contract.natural_language_explanation

def test_token_cost_calculation():
    cost = calculate_token_cost(1000, 200)
    assert cost > 0.0
    assert cost < 0.001  # Sub-cent guarantee

def test_evaluation_suite_execution():
    res = run_evaluation_suite("full_benchmark")
    assert res["total_tests"] == 7
    assert res["passed_tests"] == 7
    assert res["accuracy_percentage"] == 100.0

def test_supabase_auth_and_iam_isolation():
    from backend.auth.supabase_auth import (
        register_user, login_user, decode_supabase_jwt, require_admin, switch_user_role
    )
    import uuid

    test_email = f"test_{uuid.uuid4().hex[:6]}@spendtrace.ai"
    reg = register_user(email=test_email, password="securePassword123!", role="member")
    assert "access_token" in reg
    assert reg["user"]["role"] == "member"
    assert reg["user"]["is_clean_slate"] is True

    # Decode JWT to assert standard Supabase GoTrue claims
    claims = decode_supabase_jwt(reg["access_token"])
    assert claims["iss"] == "supabase"
    assert claims["sub"] == reg["user"]["id"]
    assert claims["app_metadata"]["role"] == "member"

    # Member user must be blocked from IAM admin operations
    with pytest.raises(Exception) as excinfo:
        require_admin({"id": reg["user"]["id"], "role": "member"})
    assert "Admin role required" in str(excinfo.value)

    # Admin user succeeds
    admin_user = require_admin({"id": "admin_uuid", "role": "admin"})
    assert admin_user["role"] == "admin"

def test_new_user_starts_clean_slate():
    from backend.auth.supabase_auth import register_user
    from backend.db.database import get_ledger_transactions, get_refund_radar_items
    import uuid

    new_user_email = f"clean_user_{uuid.uuid4().hex[:6]}@spendtrace.ai"
    reg = register_user(email=new_user_email, password="cleanPassword123!", role="member")
    user_id = reg["user"]["id"]

    # Invariant: For a new user, ALWAYS START CLEAN
    txs = get_ledger_transactions(user_id=user_id)
    assert len(txs) == 0, "New user must start with zero transactions!"

    refunds = get_refund_radar_items(user_id=user_id)
    assert len(refunds) == 0, "New user must start with zero return items!"

def test_grounded_facts_provenance():
    # Verify that all answers are grounded with deterministic SQL execution and cited record IDs
    query_contract = AnalyticsQueryAgent.answer_spending_query("Why did my spending increase?")
    assert query_contract.executed_sql != ""
    assert "SELECT" in query_contract.executed_sql
    assert len(query_contract.cited_transaction_ids) > 0
    # Every cited ID must exist in the database
    results = execute_safe_readonly_sql(
        f"SELECT id FROM transactions WHERE id IN ({','.join(['?' for _ in query_contract.cited_transaction_ids])})",
        tuple(query_contract.cited_transaction_ids)
    )
    assert len(results) == len(query_contract.cited_transaction_ids), "All facts must be grounded in real transactions"

def test_pdf_receipt_ingestion_and_formats():
    from backend.agents.extractor import IngestionExtractor
    # Verify PDF receipts are accepted and extracted cleanly
    fake_pdf_bytes = b"%PDF-1.4 Fake Apple Store PDF Receipt Content"
    contract = IngestionExtractor.parse_receipt_image(fake_pdf_bytes, "apple_store_invoice.pdf")
    assert contract.merchant_name == "Apple Store"
    assert contract.total_amount > 0
    assert len(contract.line_items) > 0
    assert "PDF" in contract.line_items[0].name or "AppleCare" in contract.line_items[0].name

def test_password_policy_and_reset():
    from backend.auth.supabase_auth import (
        validate_password_strength, register_user, reset_user_password, login_user
    )
    import uuid
    from fastapi import HTTPException

    # Test password complexity rules: >= 10 chars, >= 1 uppercase, >= 1 lowercase, >= 1 special
    with pytest.raises(HTTPException) as exc:
        validate_password_strength("Short1!")
    assert "at least 10 characters" in exc.value.detail

    with pytest.raises(HTTPException) as exc:
        validate_password_strength("alllowercase123!")
    assert "capital letter" in exc.value.detail

    with pytest.raises(HTTPException) as exc:
        validate_password_strength("ALLUPPERCASE123!")
    assert "lowercase letter" in exc.value.detail

    with pytest.raises(HTTPException) as exc:
        validate_password_strength("NoSpecialChar123")
    assert "special character" in exc.value.detail

    # Valid password passes
    validate_password_strength("ValidP@ssword123")

    # Register with username
    username = f"user_{uuid.uuid4().hex[:6]}"
    reg = register_user(email=username, password="InitialP@ssword1")
    assert reg["user"]["role"] == "member"

    # Reset password
    reset_res = reset_user_password(identifier=username, new_password="NewSecureP@ssword2")
    assert reset_res["status"] == "ok"

    # Verify login with new password
    login_res = login_user(email=username, password="NewSecureP@ssword2")
    assert "access_token" in login_res

def test_demo_admin_master_ledger_csv():
    import os
    import csv

    # Verify the simulated master ledger CSV files exist
    paths = [
        "data/spendtrace_demo_admin_master_ledger.csv",
        "frontend/public/spendtrace_demo_admin_master_ledger.csv"
    ]
    for p in paths:
        assert os.path.exists(p), f"Ledger CSV file missing: {p}"
        with open(p, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            assert len(rows) >= 10, f"Expected at least 10 benchmark rows in {p}, got {len(rows)}"
            # Verify columns (case-insensitive)
            headers_lower = {h.lower() for h in (reader.fieldnames or [])}
            expected_headers = {"id", "date", "merchant", "amount", "category", "status"}
            assert expected_headers.issubset(headers_lower)

