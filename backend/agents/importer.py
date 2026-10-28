import io
import csv
import uuid
from datetime import datetime, date
from typing import Dict, Any, List, Optional
import openpyxl

from backend.agents.categorizer import CategorizationIntelligence
from backend.db.database import get_db_connection

class SpreadsheetLedgerImporter:
    """
    Imports and intelligently categorizes ledgers, Excel sheets, and bill lists.
    Directly addresses Mint.com & Credit Karma transition needs:
    - Parses Excel (.xlsx, .xls) and CSV exports
    - Identifies uncategorized rows
    - Applies intelligent retailer categorization (e.g. Marshalls -> Apparel, Walmart -> Groceries)
    - Distinguishes credit card payoff transactions & recurring utility bills
    """

    @classmethod
    def parse_and_categorize_spreadsheet(
        cls, 
        file_bytes: bytes, 
        filename: str
    ) -> Dict[str, Any]:
        """
        Parses an uploaded spreadsheet or CSV, auto-detects schema, 
        and applies intelligent categorization to all rows.
        """
        fn_lower = filename.lower()
        rows: List[List[str]] = []

        if fn_lower.endswith(".xlsx") or fn_lower.endswith(".xls"):
            try:
                wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
                sheet = wb.active
                for r in sheet.iter_rows(values_only=True):
                    # Filter completely empty rows
                    if r and any(cell is not None for cell in r):
                        str_row = [str(c).strip() if c is not None else "" for c in r]
                        rows.append(str_row)
            except Exception as e:
                raise ValueError(f"Failed to parse Excel workbook: {e}")
        else:
            # CSV or plaintext tabular bills
            text = file_bytes.decode("utf-8", errors="ignore")
            # Auto-detect dialect delimiter
            delimiter = ","
            if "\t" in text.splitlines()[0] if text.splitlines() else "":
                delimiter = "\t"
            elif ";" in text.splitlines()[0] if text.splitlines() else "":
                delimiter = ";"
            reader = csv.reader(io.StringIO(text), delimiter=delimiter)
            for r in reader:
                if r and any(cell.strip() for cell in r):
                    rows.append([cell.strip() for cell in r])

        if not rows:
            return {
                "total_rows": 0,
                "categorized_count": 0,
                "uncategorized_before": 0,
                "records": [],
                "category_summary": {}
            }

        header = [col.lower().strip() for col in rows[0]]
        
        # 1. Map column indices
        date_idx = -1
        desc_idx = -1
        amount_idx = -1
        debit_idx = -1
        credit_idx = -1
        cat_idx = -1
        account_idx = -1

        for idx, col in enumerate(header):
            if any(term in col for term in ["date", "post date", "trans date", "tx date", "due date", "bill date"]):
                if date_idx == -1: date_idx = idx
            elif any(term in col for term in ["description", "merchant", "payee", "vendor", "store", "name", "billed by"]):
                if desc_idx == -1: desc_idx = idx
            elif any(term in col for term in ["amount", "total", "charge", "cost"]):
                if amount_idx == -1: amount_idx = idx
            elif "debit" in col:
                debit_idx = idx
            elif "credit" in col:
                credit_idx = idx
            elif any(term in col for term in ["category", "type", "tag"]):
                if cat_idx == -1: cat_idx = idx
            elif any(term in col for term in ["account", "card", "institution", "payment method"]):
                if account_idx == -1: account_idx = idx

        # Fallbacks if header mapping was inexact
        if desc_idx == -1 and len(header) >= 2:
            desc_idx = 1
        if amount_idx == -1 and len(header) >= 3 and debit_idx == -1:
            amount_idx = 2
        if date_idx == -1 and len(header) >= 1:
            date_idx = 0

        parsed_records: List[Dict[str, Any]] = []
        uncategorized_before_count = 0
        category_summary: Dict[str, Dict[str, Any]] = {}

        for r_idx, r in enumerate(rows[1:], start=2):
            if not r or len(r) <= max(desc_idx, 0):
                continue

            raw_date = r[date_idx].strip() if (date_idx != -1 and len(r) > date_idx) else str(date.today())
            raw_desc = r[desc_idx].strip() if (desc_idx != -1 and len(r) > desc_idx) else "Unknown"
            
            # Amount resolution
            amt = 0.0
            if amount_idx != -1 and len(r) > amount_idx and r[amount_idx]:
                raw_amt = r[amount_idx].replace("$", "").replace(",", "").strip()
                try:
                    amt = float(raw_amt)
                except ValueError:
                    amt = 0.0
            elif debit_idx != -1 and len(r) > debit_idx and r[debit_idx]:
                raw_debit = r[debit_idx].replace("$", "").replace(",", "").strip()
                try:
                    amt = float(raw_debit)
                except ValueError:
                    amt = 0.0
            elif credit_idx != -1 and len(r) > credit_idx and r[credit_idx]:
                raw_cred = r[credit_idx].replace("$", "").replace(",", "").strip()
                try:
                    amt = -abs(float(raw_cred)) # credits are negative expenses
                except ValueError:
                    amt = 0.0

            raw_cat = r[cat_idx].strip() if (cat_idx != -1 and len(r) > cat_idx) else ""
            account_name = r[account_idx].strip() if (account_idx != -1 and len(r) > account_idx) else "Default Ledger"

            # Check if this row was originally uncategorized
            was_uncategorized = not raw_cat or raw_cat.lower() in [
                "uncategorized", "general", "none", "misc", "miscellaneous", "other", "unknown", "n/a", ""
            ]
            if was_uncategorized:
                uncategorized_before_count += 1

            # Run SpendTrace Intelligent Categorization
            categorization = CategorizationIntelligence.infer_category(
                merchant_name=raw_desc,
                is_itemized=False, # standard spreadsheet row is non-itemized summary
                amount=amt
            )

            final_category = categorization["category"]
            clean_merchant = CategorizationIntelligence.clean_merchant_string(raw_desc)

            record = {
                "id": str(uuid.uuid4()),
                "date": raw_date,
                "merchant_raw": raw_desc,
                "merchant_clean": clean_merchant,
                "amount": amt,
                "original_category": raw_cat if raw_cat else "Uncategorized",
                "category": final_category,
                "subcategory": categorization.get("subcategory"),
                "confidence": categorization.get("confidence", 0.90),
                "reasoning": categorization.get("reasoning", "Categorized by SpendTrace"),
                "is_credit_card_payment": categorization.get("is_credit_card_payment", False),
                "is_bill": categorization.get("is_bill", False),
                "was_uncategorized": was_uncategorized,
                "account_name": account_name,
                "source": "spreadsheet_import",
                "status": "verified"
            }
            parsed_records.append(record)

            # Update category summary
            if final_category not in category_summary:
                category_summary[final_category] = {"count": 0, "total_spend": 0.0}
            category_summary[final_category]["count"] += 1
            if not categorization.get("is_credit_card_payment"):
                category_summary[final_category]["total_spend"] = round(category_summary[final_category]["total_spend"] + amt, 2)

        return {
            "filename": filename,
            "total_rows": len(parsed_records),
            "uncategorized_before": uncategorized_before_count,
            "auto_categorized_by_spendtrace": len([r for r in parsed_records if r["was_uncategorized"]]),
            "records": parsed_records,
            "category_summary": category_summary
        }

    @classmethod
    def commit_records_to_ledger(cls, records: List[Dict[str, Any]], user_id: str) -> int:
        """Commits verified and categorized rows into transactions table."""
        conn = get_db_connection()
        committed = 0
        try:
            cur = conn.cursor()
            for r in records:
                cur.execute(
                    """INSERT INTO transactions 
                       (id, user_id, account_id, date, posted_date, merchant_raw, merchant_clean, amount, category, source, status, is_return, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        r["id"],
                        user_id,
                        r.get("account_id") or "acc_chase",
                        r["date"],
                        r["date"],
                        r["merchant_raw"],
                        r["merchant_clean"],
                        r["amount"],
                        r["category"],
                        r.get("source", "spreadsheet_import"),
                        "verified",
                        1 if r["amount"] < 0 else 0,
                        f"AI Reason: {r.get('reasoning', '')}"
                    )
                )
                committed += 1
            conn.commit()
            return committed
        finally:
            conn.close()

    @classmethod
    def generate_sample_bills_excel(cls) -> bytes:
        """Generates a downloadable sample Excel sheet (.xlsx) of uncategorized bills & expenses for testing."""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Monthly Ledger & Bills"

        # Headers
        headers = ["Date", "Description / Payee", "Amount", "Current Category", "Account"]
        ws.append(headers)

        # Realistic bills and uncategorized entries (including Marshalls, Walmart, utilities, CC payment)
        today = date.today()
        sample_rows = [
            [str(today), "MARSHALLS STORE #412", 48.75, "Uncategorized", "Chase Sapphire"],
            [str(today), "WALMART SUPERCENTER #2201", 112.40, "", "BofA Checking"],
            [str(today), "PACIFIC GAS & ELECTRIC (PG&E)", 145.80, "Uncategorized", "BofA Checking"],
            [str(today), "CHASE CREDIT CARD AUTOPAY", 850.00, "", "BofA Checking"],
            [str(today), "HOME DEPOT #0612", 73.20, "None", "Chase Sapphire"],
            [str(today), "VERIZON WIRELESS BILL", 95.00, "Uncategorized", "BofA Checking"],
            [str(today), "STARBUCKS STORE 1142", 6.45, "", "Apple Card"],
            [str(today), "CVS PHARMACY #9821", 24.15, "Uncategorized", "Chase Sapphire"],
            [str(today), "SHELL OIL 5744211", 52.00, "", "Apple Card"],
            [str(today), "NETFLIX.COM DIGITAL SUBSCRIPTION", 19.99, "Uncategorized", "Apple Card"],
            [str(today), "AMEX EPAY BALANCE PAYMENT", 620.00, "", "BofA Checking"],
            [str(today), "UBER TRIP TR-98214", 28.50, "Uncategorized", "Chase Sapphire"],
        ]

        for row in sample_rows:
            ws.append(row)

        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()
