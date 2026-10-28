import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.agents.categorizer import CategorizationIntelligence
from backend.agents.importer import SpreadsheetLedgerImporter
from backend.integrations.plaid_client import PlaidIntegrationService

client = TestClient(app)

# =====================================================================
# 1. Competitive Intelligence & Retailer Categorization Tests
# =====================================================================

def test_marshalls_receipt_categorized_as_apparel():
    """Verify Marshalls non-itemized receipt or transaction is categorized as Apparel."""
    res = CategorizationIntelligence.infer_category("Marshalls", is_itemized=False)
    assert res["category"] == "Apparel"
    assert res["confidence"] >= 0.95
    assert "Marshalls" in res["reasoning"]

    # Test via API endpoint
    api_res = client.post("/api/v1/categories/infer", json={"merchant": "MARSHALLS STORE #412", "is_itemized": False})
    assert api_res.status_code == 200
    assert api_res.json()["category"] == "Apparel"

def test_walmart_non_itemized_receipt_categorized_as_groceries():
    """Verify Walmart non-itemized receipt or transaction is categorized as Groceries."""
    res = CategorizationIntelligence.infer_category("Walmart", is_itemized=False)
    assert res["category"] == "Groceries"
    assert res["confidence"] >= 0.95
    assert "non-itemized" in res["reasoning"]

    # Test via API endpoint
    api_res = client.post("/api/v1/categories/infer", json={"merchant": "WALMART SUPERCENTER #2201", "is_itemized": False})
    assert api_res.status_code == 200
    assert api_res.json()["category"] == "Groceries"

def test_walmart_itemized_electronics_overrides_to_electronics():
    """Verify that an itemized Walmart receipt with electronics prioritizes the item category."""
    res = CategorizationIntelligence.infer_category(
        "Walmart",
        is_itemized=True,
        line_items=[
            {"name": "Apple iPad 10th Gen 64GB", "total_price": 349.00, "category_hint": "Electronics"}
        ]
    )
    assert res["category"] == "Electronics"
    assert "Itemized" in res["reasoning"]

def test_credit_card_payment_tracking():
    """Verify credit card payments across cards are identified for debt & liability tracking."""
    test_cases = [
        "CHASE CREDIT CARD AUTOPAY",
        "AMEX EPAY BALANCE PAYMENT",
        "CITI CARD PAYMENT ACH",
        "CAPITAL ONE CRCARD PAYMENT"
    ]
    for cc_merchant in test_cases:
        res = CategorizationIntelligence.infer_category(cc_merchant)
        assert res["category"] == "Credit Card Payment"
        assert res["is_credit_card_payment"] is True

def test_recurring_bills_and_utilities():
    """Verify uncategorized bills (electric, water, telecom) are categorized as Bills & Utilities."""
    bills = [
        "PACIFIC GAS & ELECTRIC (PG&E)",
        "CON EDISON NY ELECTRIC",
        "VERIZON WIRELESS BILL",
        "AT&T INTERNET",
        "MUNICIPAL WATER DISTRICT"
    ]
    for b in bills:
        res = CategorizationIntelligence.infer_category(b)
        assert res["category"] == "Bills & Utilities"
        assert res["is_bill"] is True

# =====================================================================
# 2. Spreadsheet & Excel Ledger Ingestion Tests
# =====================================================================

def test_sample_bills_excel_generation_and_auto_categorization():
    """Verify generating and parsing a sample Excel ledger of uncategorized bills."""
    excel_bytes = SpreadsheetLedgerImporter.generate_sample_bills_excel()
    assert len(excel_bytes) > 0

    parsed = SpreadsheetLedgerImporter.parse_and_categorize_spreadsheet(excel_bytes, "sample_bills.xlsx")
    assert parsed["total_rows"] >= 10
    assert parsed["uncategorized_before"] >= 10
    assert parsed["auto_categorized_by_spendtrace"] == parsed["uncategorized_before"]

    # Verify specific rows
    records = {r["merchant_clean"]: r["category"] for r in parsed["records"]}
    assert records["MARSHALLS"] == "Apparel"
    assert records["WALMART SUPERCENTER"] == "Groceries"
    assert records["PACIFIC GAS & ELECTRIC (PG&E)"] == "Bills & Utilities"
    assert records["CHASE CREDIT CARD AUTOPAY"] == "Credit Card Payment"

def test_sample_bills_download_template_endpoint():
    """Verify endpoint provides downloadable .xlsx template."""
    res = client.get("/api/v1/ledger/sample-bills-template")
    assert res.status_code == 200
    assert "spreadsheetml" in res.headers["content-type"]
    assert len(res.content) > 1000

# =====================================================================
# 3. Plaid API Integration & Sandbox Account Tests
# =====================================================================

def test_plaid_link_token_creation():
    """Verify creating a Plaid Link Token returns link_token and institutions."""
    res = client.post("/api/v1/plaid/create-link-token")
    assert res.status_code == 200
    data = res.json()
    assert "link_token" in data
    assert data["is_sandbox"] is True

def test_plaid_accounts_and_credit_card_liabilities():
    """Verify retrieving connected accounts, balances, and credit card payment tracking metrics."""
    res = client.get("/api/v1/plaid/accounts")
    assert res.status_code == 200
    data = res.json()
    assert data["institutions_connected"] >= 1
    assert "credit_card_liabilities" in data
    
    liabilities = data["credit_card_liabilities"]
    assert liabilities["total_credit_balance"] > 0
    assert liabilities["total_credit_limit"] > 0
    assert len(liabilities["cards"]) >= 1
    
    first_card = liabilities["cards"][0]
    assert "min_payment_due" in first_card
    assert "next_payment_due_date" in first_card
    assert "apr" in first_card

def test_plaid_transactions_sync_with_intelligent_categorization():
    """Verify Plaid transaction feed syncs and runs SpendTrace intelligent retailer categorization."""
    res = client.post("/api/v1/plaid/sync")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "synced"
    assert data["transactions_fetched"] >= 5

    categories = [tx["category"] for tx in data["transactions"]]
    assert "Apparel" in categories        # From Marshalls in Plaid feed
    assert "Groceries" in categories      # From Walmart in Plaid feed
    assert "Credit Card Payment" in categories # From Chase Autopay in Plaid feed
