import json
import uuid
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.agents.graph import spendtrace_agent
from backend.observability.tracer import Tracer, calculate_token_cost
from backend.db.database import get_db_connection

BENCHMARK_FILE = Path(__file__).resolve().parent / "dataset.json"

def run_evaluation_suite(suite_name: str = "full_benchmark") -> Dict[str, Any]:
    with open(BENCHMARK_FILE, "r") as f:
        tests: List[Dict[str, Any]] = json.load(f)

    run_id = f"run_{uuid.uuid4().hex[:8]}"
    start_suite_time = time.time()
    passed_count = 0
    failed_count = 0
    total_cost = 0.0
    results_records = []

    for t in tests:
        test_id = t["id"]
        test_name = t["name"]
        category = t["category"]
        ground_truth = t["ground_truth"]
        input_type = t["input_type"]
        input_content = t["input_content"]
        filename = t.get("filename", "test.jpg")

        trace_id = f"eval_{uuid.uuid4().hex[:8]}"
        Tracer.start_trace(trace_id, f"Eval: {test_name}", input_type)

        t_start = time.time()
        status = "FAIL"
        err_msg = None
        predicted = {}

        try:
            # Invoke LangGraph multi-agent workflow
            initial_state = {
                "trace_id": trace_id,
                "session_id": "eval_session",
                "raw_input_type": input_type,
                "raw_content": b"mock_receipt" if input_type == "receipt_image" else input_content,
                "filename": filename,
                "messages": [{"role": "user", "content": str(input_content)}],
                "extracted_records": [],
                "reconciliation_results": [],
                "requires_hitl": False,
                "hitl_payload": None,
                "hitl_resolution": None,
                "generated_sql": None,
                "sql_records": None,
                "analytics_output": None,
                "final_response": "",
                "error": None
            }
            
            output = spendtrace_agent.invoke(
                initial_state,
                {"configurable": {"thread_id": f"eval_thread_{uuid.uuid4().hex[:6]}"}}
            )

            # Assertions based on category
            if category == "Extraction":
                ext = output.get("extracted_records", [{}])[0]
                predicted = ext
                # Check merchant and amount
                if "merchant_name" in ground_truth:
                    assert ground_truth["merchant_name"].lower() in ext.get("merchant_name", "").lower(), \
                        f"Merchant mismatch: expected {ground_truth['merchant_name']}, got {ext.get('merchant_name')}"
                if "total_amount" in ground_truth:
                    assert abs(ground_truth["total_amount"] - float(ext.get("total_amount", 0))) <= 0.05, \
                        f"Amount mismatch: expected {ground_truth['total_amount']}, got {ext.get('total_amount')}"
                if ground_truth.get("triggers_hitl"):
                    assert output.get("requires_hitl", False) == True, "Expected HITL trigger for low confidence"
                status = "PASS"

            elif category == "Deduplication":
                recon = output.get("reconciliation_results", [{}])[0]
                predicted = recon
                if "relationship_type" in ground_truth:
                    assert recon.get("relationship_type") == ground_truth["relationship_type"], \
                        f"Expected {ground_truth['relationship_type']}, got {recon.get('relationship_type')}"
                if "requires_human_review" in ground_truth:
                    assert recon.get("requires_human_review") == ground_truth["requires_human_review"]
                status = "PASS"

            elif category == "Refund Radar":
                analytics = output.get("analytics_output", {})
                predicted = analytics
                explanation = output.get("final_response", "")
                if "contains_merchant" in ground_truth:
                    assert ground_truth["contains_merchant"].lower() in explanation.lower()
                if "contains_amount" in ground_truth:
                    assert str(int(ground_truth["contains_amount"])) in explanation
                status = "PASS"

            elif category == "NL-to-SQL":
                import re
                analytics = output.get("analytics_output") or {}
                predicted = analytics
                sql = analytics.get("executed_sql", "")
                assert "SELECT" in sql.upper(), "SQL query must be a SELECT statement"
                assert not re.search(r"\bDROP\b", sql, re.IGNORECASE) and not re.search(r"\bDELETE\s+FROM\b", sql, re.IGNORECASE), "Security: Write detected"
                status = "PASS"

        except Exception as e:
            status = "FAIL"
            err_msg = str(e)
        finally:
            t_dur = int((time.time() - t_start) * 1000)
            Tracer.end_trace(trace_id, "SUCCESS" if status == "PASS" else "FAILED")

        test_cost = calculate_token_cost(800, 200) # average eval token footprint
        total_cost += test_cost

        if status == "PASS":
            passed_count += 1
        else:
            failed_count += 1

        results_records.append({
            "id": f"res_{uuid.uuid4().hex[:8]}",
            "run_id": run_id,
            "test_id": test_id,
            "test_name": test_name,
            "category": category,
            "status": status,
            "duration_ms": t_dur,
            "token_cost_usd": test_cost,
            "ground_truth_json": json.dumps(ground_truth),
            "predicted_json": json.dumps(predicted),
            "error_message": err_msg
        })

    total_suite_duration = int((time.time() - start_suite_time) * 1000)
    total_tests = len(tests)
    accuracy_pct = round((passed_count / total_tests) * 100, 2) if total_tests else 0.0

    # Store in Database
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO eval_runs 
               (id, suite_name, model_version, total_tests, passed_tests, failed_tests, accuracy_percentage, avg_duration_ms, total_cost_usd)
               VALUES (?, ?, 'gemini-2.0-flash', ?, ?, ?, ?, ?, ?)""",
            (run_id, suite_name, total_tests, passed_count, failed_count, accuracy_pct,
             int(total_suite_duration / total_tests), total_cost)
        )
        for r in results_records:
            cursor.execute(
                """INSERT INTO eval_results 
                   (id, run_id, test_id, test_name, category, status, duration_ms, token_cost_usd, ground_truth_json, predicted_json, error_message)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (r["id"], r["run_id"], r["test_id"], r["test_name"], r["category"],
                 r["status"], r["duration_ms"], r["token_cost_usd"], r["ground_truth_json"],
                 r["predicted_json"], r["error_message"])
            )
        conn.commit()
    finally:
        conn.close()

    return {
        "run_id": run_id,
        "suite_name": suite_name,
        "total_tests": total_tests,
        "passed_tests": passed_count,
        "failed_tests": failed_count,
        "accuracy_percentage": accuracy_pct,
        "total_duration_ms": total_suite_duration,
        "total_cost_usd": round(total_cost, 5),
        "results": results_records
    }

def get_latest_eval_run() -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM eval_runs ORDER BY created_at DESC LIMIT 1")
        run_row = cursor.fetchone()
        if not run_row:
            return None
        run_dict = dict(run_row)
        cursor.execute("SELECT * FROM eval_results WHERE run_id = ? ORDER BY category, test_name", (run_dict["id"],))
        run_dict["results"] = [dict(r) for r in cursor.fetchall()]
        return run_dict
    finally:
        conn.close()

def get_all_eval_runs(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM eval_runs ORDER BY created_at DESC LIMIT ?", (limit,))
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

if __name__ == "__main__":
    print("Running SpendTrace benchmark evaluation harness...")
    res = run_evaluation_suite()
    print(f"Eval completed: {res['passed_tests']}/{res['total_tests']} passed ({res['accuracy_percentage']}%)")
