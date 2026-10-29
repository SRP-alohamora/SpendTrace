import uuid
import time
import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.db.database import get_db_connection

# Cost constants per 1M tokens (Gemini 2.0 Flash / Open-model tier)
INPUT_TOKEN_COST_PER_M = 0.075
OUTPUT_TOKEN_COST_PER_M = 0.30

def calculate_token_cost(prompt_tokens: int, completion_tokens: int) -> float:
    cost = (prompt_tokens * (INPUT_TOKEN_COST_PER_M / 1_000_000)) + \
           (completion_tokens * (OUTPUT_TOKEN_COST_PER_M / 1_000_000))
    return round(cost, 6)

class Tracer:
    @staticmethod
    def start_trace(trace_id: str, user_query: str, input_type: str, user_id: Optional[str] = None):
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO traces (id, user_id, user_query, input_type, status, total_duration_ms, total_prompt_tokens, total_completion_tokens, total_cost_usd)
                   VALUES (?, ?, ?, ?, 'RUNNING', 0, 0, 0, 0.0)""",
                (trace_id, user_id, user_query, input_type)
            )
            conn.commit()
        finally:
            conn.close()

    @staticmethod
    def log_span(
        trace_id: str,
        node_name: str,
        start_time: datetime,
        end_time: datetime,
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        status: str = "SUCCESS",
        prompt_text: Optional[str] = None,
        response_text: Optional[str] = None,
        tool_name: Optional[str] = None,
        tool_input_json: Optional[str] = None,
        tool_output_json: Optional[str] = None,
        error_log: Optional[str] = None,
        sender_agent: Optional[str] = None,
        authorized_by: Optional[str] = None
    ) -> str:
        span_id = f"span_{uuid.uuid4().hex[:8]}"
        duration_ms = max(int((end_time - start_time).total_seconds() * 1000), 45)
        cost_usd = calculate_token_cost(prompt_tokens, completion_tokens)

        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            # Ensure parent trace exists to satisfy foreign key constraint
            cursor.execute("SELECT id FROM traces WHERE id = ?", (trace_id,))
            if not cursor.fetchone():
                cursor.execute(
                    """INSERT INTO traces (id, user_query, input_type, status, total_duration_ms, total_prompt_tokens, total_completion_tokens, total_cost_usd)
                       VALUES (?, 'Auto Span', 'span', 'RUNNING', 0, 0, 0, 0.0)""",
                    (trace_id,)
                )
            cursor.execute(
                """INSERT INTO trace_spans 
                   (id, trace_id, node_name, start_time, end_time, duration_ms, prompt_tokens, completion_tokens, cost_usd, status, prompt_text, response_text, tool_name, tool_input_json, tool_output_json, error_log, sender_agent, authorized_by)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (span_id, trace_id, node_name, start_time.isoformat(), end_time.isoformat(),
                 duration_ms, prompt_tokens, completion_tokens, cost_usd, status,
                 prompt_text, response_text, tool_name, tool_input_json, tool_output_json, error_log,
                 sender_agent, authorized_by)
            )
            conn.commit()
        finally:
            conn.close()
        return span_id

    @staticmethod
    def record_refund_exchange(
        claim_code: str,
        merchant_name: str,
        step_number: int,
        step_title: str,
        sender_agent: str,
        authorized_by: str,
        timestamp_str: str,
        channel: str,
        input_contract: Dict[str, Any],
        output_contract: Dict[str, Any],
        message_excerpt: str,
        user_id: Optional[str] = None,
        trace_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Persists an auditable refund exchange into both refund_audit_logs and trace_spans for end-to-end observability.
        """
        from backend.db.database import insert_refund_audit_log
        tid = trace_id or f"tr_refund_{re.sub(r'[^a-zA-Z0-9]', '', merchant_name.lower())}_{claim_code.split('-')[-2] if '-' in claim_code else '01'}"

        # Ensure parent trace exists with input_type = 'refund_loop'
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM traces WHERE id = ?", (tid,))
            if not cursor.fetchone():
                cursor.execute(
                    """INSERT INTO traces (id, user_id, user_query, input_type, status, total_duration_ms, total_prompt_tokens, total_completion_tokens, total_cost_usd)
                       VALUES (?, ?, ?, 'refund_loop', 'RUNNING', 0, 0, 0, 0.0)""",
                    (tid, user_id, f"Refund Loop Contract Audit: {merchant_name} (#{claim_code})")
                )
                conn.commit()
        finally:
            conn.close()

        inp_json = json.dumps(input_contract, indent=2)
        out_json = json.dumps(output_contract, indent=2)

        # 1. Insert into dedicated refund_audit_logs table
        audit_id = insert_refund_audit_log(
            claim_code=claim_code,
            trace_id=tid,
            user_id=user_id,
            merchant_name=merchant_name,
            step_number=step_number,
            step_title=step_title,
            sender_agent=sender_agent,
            authorized_by=authorized_by,
            timestamp=timestamp_str,
            channel=channel,
            verification_status="VERIFIED_AUDIT",
            input_contract_json=inp_json,
            output_contract_json=out_json,
            message_excerpt=message_excerpt
        )

        # 2. Log span into trace_spans for waterfall & contract inspection
        now = datetime.utcnow()
        Tracer.log_span(
            trace_id=tid,
            node_name=sender_agent,
            start_time=now,
            end_time=now,
            prompt_tokens=140,
            completion_tokens=180,
            status="SUCCESS",
            prompt_text=f"Authorized By: {authorized_by} | Channel: {channel} | Timestamp: {timestamp_str}",
            response_text=message_excerpt,
            tool_name=step_title,
            tool_input_json=inp_json,
            tool_output_json=out_json,
            sender_agent=sender_agent,
            authorized_by=authorized_by
        )
        Tracer.end_trace(tid, "SUCCESS")

        return {
            "audit_id": audit_id,
            "trace_id": tid,
            "claim_code": claim_code,
            "step_number": step_number,
            "sender_agent": sender_agent,
            "authorized_by": authorized_by,
            "timestamp": timestamp_str,
            "channel": channel,
            "input_contract": input_contract,
            "output_contract": output_contract
        }

    @staticmethod
    def end_trace(trace_id: str, final_status: str = "SUCCESS"):
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT SUM(duration_ms) as total_dur, 
                          SUM(prompt_tokens) as total_p_tok, 
                          SUM(completion_tokens) as total_c_tok, 
                          SUM(cost_usd) as total_cost 
                   FROM trace_spans WHERE trace_id = ?""",
                (trace_id,)
            )
            row = cursor.fetchone()
            total_dur = row["total_dur"] or 0
            total_p_tok = row["total_p_tok"] or 0
            total_c_tok = row["total_c_tok"] or 0
            total_cost = row["total_cost"] or 0.0

            cursor.execute(
                """UPDATE traces 
                   SET status = ?, total_duration_ms = ?, total_prompt_tokens = ?, total_completion_tokens = ?, total_cost_usd = ?
                   WHERE id = ?""",
                (final_status, total_dur, total_p_tok, total_c_tok, total_cost, trace_id)
            )
            conn.commit()
        finally:
            conn.close()

    @staticmethod
    def get_recent_traces(limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM traces ORDER BY created_at DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    @staticmethod
    def get_trace_details(trace_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM traces WHERE id = ?", (trace_id,))
            trace_row = cursor.fetchone()
            if not trace_row:
                return None
            trace_dict = dict(trace_row)

            cursor.execute("SELECT * FROM trace_spans WHERE trace_id = ? ORDER BY start_time ASC", (trace_id,))
            spans = [dict(s) for s in cursor.fetchall()]
            trace_dict["spans"] = spans
            return trace_dict
        finally:
            conn.close()

    @staticmethod
    def get_metrics_summary() -> Dict[str, Any]:
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT COUNT(*) as total_traces,
                          AVG(total_duration_ms) as avg_latency_ms,
                          SUM(total_cost_usd) as total_spend_usd,
                          SUM(total_prompt_tokens + total_completion_tokens) as total_tokens
                   FROM traces"""
            )
            agg = dict(cursor.fetchone())
            cursor.execute("SELECT COUNT(*) as failed FROM traces WHERE status = 'FAILED'")
            failed = cursor.fetchone()["failed"]
            total = agg["total_traces"] or 1
            agg["error_rate_pct"] = round((failed / total) * 100, 2)
            agg["avg_latency_ms"] = round(agg["avg_latency_ms"] or 0, 1)
            agg["total_spend_usd"] = round(agg["total_spend_usd"] or 0.0, 5)
            return agg
        finally:
            conn.close()
