import re
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from backend.agents.state import ExtractionContract, ReconciliationAnomalyContract
from backend.db.database import get_db_connection

def calculate_string_similarity(a: str, b: str) -> float:
    """Computes a normalized Levenshtein-like token overlap similarity between two merchant strings."""
    a_clean = re.sub(r"[^a-zA-Z0-9\s]", "", a.lower()).strip()
    b_clean = re.sub(r"[^a-zA-Z0-9\s]", "", b.lower()).strip()
    if not a_clean or not b_clean:
        return 0.0
    if a_clean == b_clean or a_clean in b_clean or b_clean in a_clean:
        return 1.0
    a_tokens = set(a_clean.split())
    b_tokens = set(b_clean.split())
    intersection = a_tokens.intersection(b_tokens)
    union = a_tokens.union(b_tokens)
    return len(intersection) / len(union) if union else 0.0

class ReconciliationAgent:
    @staticmethod
    def reconcile_candidate(record: ExtractionContract, user_id: Optional[str] = None) -> ReconciliationAnomalyContract:
        """Cross-checks an extracted receipt or expense against existing database transactions."""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cand_amount = float(record.total_amount)
            cand_merchant = record.merchant_name
            cand_date_str = record.receipt_date
            try:
                cand_date = datetime.strptime(cand_date_str, "%Y-%m-%d").date()
            except Exception:
                cand_date = date.today()

            # Date window: +/- 3 days
            min_date = str(cand_date - timedelta(days=3))
            max_date = str(cand_date + timedelta(days=3))

            # Case A: If this is a return slip, look for matching negative statement credits
            if record.is_return_slip:
                if user_id:
                    cursor.execute(
                        """SELECT * FROM transactions 
                           WHERE user_id = ? AND is_return = 1 AND amount < 0 AND date >= ? 
                           ORDER BY date DESC""",
                        (user_id, str(cand_date))
                    )
                else:
                    cursor.execute(
                        """SELECT * FROM transactions 
                           WHERE is_return = 1 AND amount < 0 AND date >= ? 
                           ORDER BY date DESC""",
                        (str(cand_date),)
                    )
                credits = cursor.fetchall()
                for c in credits:
                    sim = calculate_string_similarity(cand_merchant, c["merchant_clean"])
                    if sim >= 0.70 and abs(abs(c["amount"]) - cand_amount) <= 1.0:
                        return ReconciliationAnomalyContract(
                            relationship_type="return_credit_matched",
                            matched_transaction_id=c["id"],
                            match_confidence=round(sim, 2),
                            requires_human_review=False,
                            conflict_reason=None,
                            proposed_actions=["link_refund_credit"]
                        )
                # If no matching credit found, this is an active pending return
                return ReconciliationAnomalyContract(
                    relationship_type="orphan_return",
                    match_confidence=1.0,
                    requires_human_review=True,
                    conflict_reason=f"No matching bank credit found for return to {cand_merchant} ($ {cand_amount:.2f}).",
                    proposed_actions=["track_on_refund_radar", "alert_overdue_if_needed"]
                )

            # Case B: Look for existing statement charges to deduplicate / merge
            if user_id:
                cursor.execute(
                    """SELECT * FROM transactions 
                       WHERE user_id = ? AND date BETWEEN ? AND ? AND status != 'deleted'""",
                    (user_id, min_date, max_date)
                )
            else:
                cursor.execute(
                    """SELECT * FROM transactions 
                       WHERE date BETWEEN ? AND ? AND status != 'deleted'""",
                    (min_date, max_date)
                )
            potential_matches = cursor.fetchall()

            for tx in potential_matches:
                sim = calculate_string_similarity(cand_merchant, tx["merchant_clean"])
                amt_diff = abs(tx["amount"] - cand_amount)

                # Exact duplicate detection: same amount, strong merchant match, within window
                if sim >= 0.75 and amt_diff < 0.05:
                    if tx["source"] == "csv_statement":
                        # We have a bank charge matching this paper receipt!
                        return ReconciliationAnomalyContract(
                            relationship_type="statement_match",
                            matched_transaction_id=tx["id"],
                            match_confidence=round(sim, 2),
                            requires_human_review=True, # Human reviews merge
                            conflict_reason=f"Found matching bank transaction on {tx['date']} for ${tx['amount']:.2f} at {tx['merchant_clean']}.",
                            proposed_actions=["merge_receipt_with_statement", "keep_both_separate"]
                        )
                    else:
                        # Duplicate manual entry
                        return ReconciliationAnomalyContract(
                            relationship_type="duplicate_charge",
                            matched_transaction_id=tx["id"],
                            match_confidence=round(sim, 2),
                            requires_human_review=True,
                            conflict_reason=f"Suspected duplicate: An expense of ${cand_amount:.2f} at {cand_merchant} was already logged on {tx['date']}.",
                            proposed_actions=["discard_duplicate", "keep_both_separate"]
                        )

            # Case C: Clean, brand-new unique purchase
            return ReconciliationAnomalyContract(
                relationship_type="unique_new",
                match_confidence=1.0,
                requires_human_review=(record.confidence_score < 0.80), # Trigger HITL if OCR confidence is low
                conflict_reason="Low OCR confidence score." if record.confidence_score < 0.80 else None,
                proposed_actions=["commit_to_ledger"]
            )

        finally:
            conn.close()
