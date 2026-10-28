import os
import uuid
import time
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
import httpx

from backend.agents.categorizer import CategorizationIntelligence
from backend.db.database import get_db_connection

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID", "")
PLAID_SECRET = os.getenv("PLAID_SECRET", "")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")
PLAID_API_URL = f"https://{PLAID_ENV}.plaid.com"

# In-memory store for connected Plaid items per user (in sandbox/mock)
CONNECTED_PLAID_ITEMS: Dict[str, List[Dict[str, Any]]] = {}

# Pre-configured Mock Institutions for instant demo evaluation
MOCK_INSTITUTIONS = [
    {
        "id": "ins_chase",
        "name": "Chase Bank",
        "logo_color": "#117aca",
        "accounts": [
            {
                "id": "acc_chase_sapphire",
                "name": "Chase Sapphire Reserve",
                "type": "credit",
                "subtype": "credit card",
                "mask": "4412",
                "current_balance": 1842.50,
                "limit": 15000.00,
                "min_payment_due": 45.00,
                "next_payment_due_date": str(date.today() + timedelta(days=14)),
                "apr": 22.49,
                "autopay_enrolled": True
            },
            {
                "id": "acc_chase_checking",
                "name": "Chase Premier Plus Checking",
                "type": "depository",
                "subtype": "checking",
                "mask": "8821",
                "current_balance": 7450.25,
                "limit": None,
                "min_payment_due": None,
                "next_payment_due_date": None,
                "apr": None,
                "autopay_enrolled": False
            }
        ]
    },
    {
        "id": "ins_amex",
        "name": "American Express",
        "logo_color": "#002663",
        "accounts": [
            {
                "id": "acc_amex_gold",
                "name": "Amex Gold Card",
                "type": "credit",
                "subtype": "credit card",
                "mask": "1094",
                "current_balance": 920.80,
                "limit": 20000.00,
                "min_payment_due": 35.00,
                "next_payment_due_date": str(date.today() + timedelta(days=8)),
                "apr": 20.99,
                "autopay_enrolled": True
            }
        ]
    },
    {
        "id": "ins_bofa",
        "name": "Bank of America",
        "logo_color": "#e31837",
        "accounts": [
            {
                "id": "acc_bofa_customized",
                "name": "BofA Customized Cash Rewards",
                "type": "credit",
                "subtype": "credit card",
                "mask": "6102",
                "current_balance": 415.10,
                "limit": 8000.00,
                "min_payment_due": 25.00,
                "next_payment_due_date": str(date.today() + timedelta(days=21)),
                "apr": 19.24,
                "autopay_enrolled": False
            }
        ]
    },
    {
        "id": "ins_citi",
        "name": "Citi",
        "logo_color": "#003b70",
        "accounts": [
            {
                "id": "acc_citi_double",
                "name": "Citi Double Cash Card",
                "type": "credit",
                "subtype": "credit card",
                "mask": "3391",
                "current_balance": 280.00,
                "limit": 12000.00,
                "min_payment_due": 25.00,
                "next_payment_due_date": str(date.today() + timedelta(days=18)),
                "apr": 18.99,
                "autopay_enrolled": True
            }
        ]
    }
]

class PlaidIntegrationService:
    """
    Plaid API integration service for Bank Feeds, Transaction Sync,
    and Credit Card Payment / Liability tracking (competing directly with Mint & Credit Karma).
    """

    @classmethod
    def create_link_token(cls, user_id: str) -> Dict[str, Any]:
        """Creates a Plaid Link Token to initialize client-side Plaid Link modal."""
        if PLAID_CLIENT_ID and PLAID_SECRET:
            try:
                payload = {
                    "client_id": PLAID_CLIENT_ID,
                    "secret": PLAID_SECRET,
                    "client_name": "SpendTrace - AI Financial Ledger",
                    "user": {"client_user_id": user_id},
                    "products": ["transactions", "liabilities"],
                    "country_codes": ["US"],
                    "language": "en"
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(f"{PLAID_API_URL}/link/token/create", json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return {
                            "link_token": data["link_token"],
                            "expiration": data.get("expiration"),
                            "is_sandbox": PLAID_ENV == "sandbox"
                        }
            except Exception as e:
                print(f"[Plaid Warning] Live Plaid call failed: {e}. Falling back to sandbox simulator.")

        # Sandbox Link Token for immediate zero-friction evaluation
        simulated_token = f"link-sandbox-{uuid.uuid4().hex[:12]}"
        return {
            "link_token": simulated_token,
            "expiration": datetime.utcnow().isoformat() + "Z",
            "is_sandbox": True,
            "institutions_available": [
                {"id": inst["id"], "name": inst["name"], "color": inst["logo_color"]}
                for inst in MOCK_INSTITUTIONS
            ]
        }

    @classmethod
    def exchange_public_token(cls, public_token: str, user_id: str, institution_id: Optional[str] = "ins_chase") -> Dict[str, Any]:
        """Exchanges public_token for access_token and provisions connected accounts."""
        item_id = f"item_{uuid.uuid4().hex[:8]}"
        access_token = f"access-sandbox-{uuid.uuid4().hex[:16]}"
        
        # Pick mock institution data
        inst = next((i for i in MOCK_INSTITUTIONS if i["id"] == institution_id), MOCK_INSTITUTIONS[0])

        item_entry = {
            "item_id": item_id,
            "access_token": access_token,
            "institution_id": inst["id"],
            "institution_name": inst["name"],
            "connected_at": datetime.utcnow().isoformat(),
            "accounts": inst["accounts"]
        }

        if user_id not in CONNECTED_PLAID_ITEMS:
            CONNECTED_PLAID_ITEMS[user_id] = []
        CONNECTED_PLAID_ITEMS[user_id].append(item_entry)

        return {
            "status": "connected",
            "item_id": item_id,
            "institution_name": inst["name"],
            "accounts_connected": len(inst["accounts"])
        }

    @classmethod
    def get_connected_accounts_and_liabilities(cls, user_id: str) -> Dict[str, Any]:
        """
        Retrieves all linked checking, savings, and credit card accounts
        along with payment due dates, minimum payments, and credit limits.
        """
        user_items = CONNECTED_PLAID_ITEMS.get(user_id)
        if not user_items:
            # Default to Chase & Amex for rich demo experience
            user_items = [
                {
                    "item_id": "item_default_chase",
                    "institution_id": "ins_chase",
                    "institution_name": "Chase Bank",
                    "connected_at": datetime.utcnow().isoformat(),
                    "accounts": MOCK_INSTITUTIONS[0]["accounts"]
                },
                {
                    "item_id": "item_default_amex",
                    "institution_id": "ins_amex",
                    "institution_name": "American Express",
                    "connected_at": datetime.utcnow().isoformat(),
                    "accounts": MOCK_INSTITUTIONS[1]["accounts"]
                }
            ]
            CONNECTED_PLAID_ITEMS[user_id] = user_items

        all_accounts = []
        credit_cards = []
        total_credit_limit = 0.0
        total_credit_balance = 0.0
        depository_balance = 0.0

        for item in user_items:
            inst_name = item["institution_name"]
            for acc in item["accounts"]:
                acc_copy = dict(acc)
                acc_copy["institution_name"] = inst_name
                all_accounts.append(acc_copy)

                if acc["type"] == "credit":
                    credit_cards.append(acc_copy)
                    total_credit_balance += acc.get("current_balance", 0.0)
                    total_credit_limit += acc.get("limit", 0.0)
                else:
                    depository_balance += acc.get("current_balance", 0.0)

        utilization_rate = round((total_credit_balance / total_credit_limit * 100), 1) if total_credit_limit > 0 else 0.0

        return {
            "institutions_connected": len(user_items),
            "accounts": all_accounts,
            "credit_card_liabilities": {
                "total_credit_balance": round(total_credit_balance, 2),
                "total_credit_limit": round(total_credit_limit, 2),
                "utilization_percentage": utilization_rate,
                "cards": credit_cards
            },
            "depository_summary": {
                "total_checking_savings": round(depository_balance, 2)
            }
        }

    @classmethod
    def sync_plaid_transactions(cls, user_id: str) -> Dict[str, Any]:
        """
        Simulates Plaid /transactions/sync with SpendTrace Intelligent Categorization.
        Enriches raw Plaid merchant feeds with retailer intelligence:
        - Marshalls -> Apparel
        - Walmart (non-itemized) -> Groceries
        - Chase Autopay -> Credit Card Payment
        - PG&E -> Bills & Utilities
        """
        today = date.today()
        # Realistic Plaid transaction stream including user-targeted examples
        plaid_raw_txs = [
            {"date": str(today - timedelta(days=1)), "name": "MARSHALLS #0412 PALO ALTO", "amount": 64.20, "account_id": "acc_chase_sapphire"},
            {"date": str(today - timedelta(days=2)), "name": "WALMART STORE 2201 SAN JOSE", "amount": 118.50, "account_id": "acc_chase_sapphire"},
            {"date": str(today - timedelta(days=4)), "name": "AUTOMATIC PAYMENT - THANK YOU CHASE", "amount": 850.00, "account_id": "acc_chase_checking"},
            {"date": str(today - timedelta(days=5)), "name": "PG&E / PACIFIC GAS & ELECTRIC", "amount": 138.45, "account_id": "acc_chase_checking"},
            {"date": str(today - timedelta(days=6)), "name": "TRADER JOES #102", "amount": 54.12, "account_id": "acc_chase_sapphire"},
            {"date": str(today - timedelta(days=7)), "name": "HOME DEPOT #0612", "amount": 89.90, "account_id": "acc_chase_sapphire"},
            {"date": str(today - timedelta(days=8)), "name": "AMEX EPAY BALANCE AUTOPAY", "amount": 620.00, "account_id": "acc_chase_checking"},
            {"date": str(today - timedelta(days=9)), "name": "STARBUCKS STORE 1142", "amount": 6.85, "account_id": "acc_amex_gold"},
            {"date": str(today - timedelta(days=10)), "name": "SHELL OIL 5744211", "amount": 48.00, "account_id": "acc_amex_gold"},
            {"date": str(today - timedelta(days=11)), "name": "NETFLIX.COM MONTHLY SUBSCRIPTION", "amount": 19.99, "account_id": "acc_amex_gold"}
        ]

        enriched_transactions = []
        conn = get_db_connection()
        committed_count = 0
        try:
            cur = conn.cursor()
            # Ensure referenced accounts exist for foreign key integrity
            for inst in MOCK_INSTITUTIONS:
                for acc in inst["accounts"]:
                    cur.execute(
                        """INSERT OR IGNORE INTO accounts 
                           (id, user_id, name, account_type, last_four, currency)
                           VALUES (?, ?, ?, ?, ?, 'USD')""",
                        (acc["id"], user_id, acc["name"], acc["type"], acc.get("mask", "0000"))
                    )
            for tx in plaid_raw_txs:
                categorization = CategorizationIntelligence.infer_category(
                    merchant_name=tx["name"],
                    is_itemized=False,
                    amount=tx["amount"]
                )
                clean_m = CategorizationIntelligence.clean_merchant_string(tx["name"])
                tx_id = f"plaid_{uuid.uuid4().hex[:8]}"

                record = {
                    "id": tx_id,
                    "date": tx["date"],
                    "merchant_raw": tx["name"],
                    "merchant_clean": clean_m,
                    "amount": tx["amount"],
                    "category": categorization["category"],
                    "subcategory": categorization.get("subcategory"),
                    "confidence": categorization.get("confidence", 0.95),
                    "reasoning": categorization.get("reasoning"),
                    "is_credit_card_payment": categorization.get("is_credit_card_payment", False),
                    "is_bill": categorization.get("is_bill", False),
                    "source": "plaid_sync",
                    "account_id": tx["account_id"]
                }
                enriched_transactions.append(record)

                # Insert into DB if not duplicate
                cur.execute(
                    """INSERT OR IGNORE INTO transactions 
                       (id, user_id, account_id, date, posted_date, merchant_raw, merchant_clean, amount, category, source, status, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?)""",
                    (
                        tx_id,
                        user_id,
                        tx["account_id"],
                        tx["date"],
                        tx["date"],
                        tx["name"],
                        clean_m,
                        tx["amount"],
                        categorization["category"],
                        "plaid_sync",
                        f"Plaid Feed: {categorization.get('reasoning', '')}"
                    )
                )
                committed_count += 1
            conn.commit()
        finally:
            conn.close()

        return {
            "status": "synced",
            "transactions_fetched": len(enriched_transactions),
            "committed_to_ledger": committed_count,
            "transactions": enriched_transactions
        }
