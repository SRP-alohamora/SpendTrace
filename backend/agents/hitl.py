import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.agents.state import (
    HITLInterruptContract, 
    OptionChoice, 
    HITLResolutionContract,
    ExtractionContract,
    ReconciliationAnomalyContract
)
from backend.db.database import get_db_connection

class HITLAgent:
    @staticmethod
    def create_clarification_card(
        trace_id: str,
        record: ExtractionContract,
        reconcile_result: ReconciliationAnomalyContract,
        user_id: Optional[str] = None
    ) -> HITLInterruptContract:
        """Constructs an interactive UI card payload and queues it in the database."""
        interrupt_id = f"hitl_{uuid.uuid4().hex[:8]}"
        issue_type = "low_confidence_ocr"
        prompt_title = "Clarification Required"
        prompt_message = "Please verify this expense before it is committed."
        options = []
        diff_payload = {
            "candidate": record.model_dump(),
            "reconciliation": reconcile_result.model_dump()
        }

        if reconcile_result.relationship_type == "statement_match":
            issue_type = "suspected_duplicate"
            prompt_title = f"Matching Bank Charge Found: {record.merchant_name}"
            prompt_message = (
                f"We found an existing card charge of ${record.total_amount:.2f} at {record.merchant_name}. "
                "Would you like to attach this receipt to that charge or keep both as separate purchases?"
            )
            options = [
                OptionChoice(id="opt_merge", label="Attach Receipt to Card Charge (Recommended)", action_type="merge", is_recommended=True),
                OptionChoice(id="opt_keep", label="Keep Both (Two Separate Purchases)", action_type="keep_separate", is_recommended=False)
            ]

        elif reconcile_result.relationship_type == "duplicate_charge":
            issue_type = "suspected_duplicate"
            prompt_title = f"Duplicate Charge Detected: {record.merchant_name}"
            prompt_message = (
                f"An identical charge of ${record.total_amount:.2f} was already recorded within the last 24 hours. "
                "Is this an accidental double-entry or a second purchase?"
            )
            options = [
                OptionChoice(id="opt_dismiss", label="Discard Duplicate (Keep Original)", action_type="dismiss", is_recommended=True),
                OptionChoice(id="opt_keep", label="Keep Both (I bought this twice)", action_type="keep_separate", is_recommended=False)
            ]

        elif reconcile_result.relationship_type == "orphan_return":
            issue_type = "orphan_return"
            prompt_title = f"Track Return to {record.merchant_name} (${record.total_amount:.2f})"
            prompt_message = (
                f"You have logged a return slip for ${record.total_amount:.2f} at {record.merchant_name}. "
                "No refund has credited to your bank account yet. Track this on Refund Radar?"
            )
            options = [
                OptionChoice(id="opt_track", label="Track on Refund Radar (Alert me in 10 days)", action_type="merge", is_recommended=True),
                OptionChoice(id="opt_dismiss", label="Already Refunded in Cash / Store Credit", action_type="dismiss", is_recommended=False)
            ]

        else:
            # Low confidence OCR (<0.80)
            issue_type = "low_confidence_ocr"
            prompt_title = f"Verify Extracted Details: {record.merchant_name}"
            prompt_message = (
                f"The receipt image was slightly blurry (Confidence: {int(record.confidence_score * 100)}%). "
                f"Please confirm: Merchant '{record.merchant_name}', Total ${record.total_amount:.2f}, Date {record.receipt_date}."
            )
            options = [
                OptionChoice(id="opt_confirm", label="Details are Correct", action_type="merge", is_recommended=True),
                OptionChoice(id="opt_edit", label="Edit Fields Manually", action_type="edit_fields", is_recommended=False)
            ]

        contract = HITLInterruptContract(
            interrupt_id=interrupt_id,
            trace_id=trace_id,
            issue_type=issue_type,
            prompt_title=prompt_title,
            prompt_message=prompt_message,
            selectable_options=options,
            diff_payload=diff_payload
        )

        # Persist in clarification_queue
        from backend.db.database import DEMO_ADMIN_ID
        active_user_id = user_id or DEMO_ADMIN_ID
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO clarification_queue 
                   (id, user_id, entity_type, entity_id, issue_type, prompt_question, options_json, diff_payload_json, resolved)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
                (interrupt_id, active_user_id, "receipt", trace_id, issue_type, prompt_message,
                 json.dumps([o.model_dump() for o in options]), json.dumps(diff_payload))
            )
            conn.commit()
        finally:
            conn.close()

        return contract

    @staticmethod
    def resolve_clarification(resolution: HITLResolutionContract) -> Dict[str, Any]:
        """Applies human decision when resumed."""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE clarification_queue 
                   SET resolved = 1, resolution_choice = ? 
                   WHERE id = ?""",
                (resolution.selected_option_id, resolution.interrupt_id)
            )
            conn.commit()
            return {"status": "resolved", "interrupt_id": resolution.interrupt_id, "action": resolution.selected_option_id}
        finally:
            conn.close()
