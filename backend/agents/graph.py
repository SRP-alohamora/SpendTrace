import uuid
from datetime import datetime
from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from backend.agents.state import AgentState, ExtractionContract
from backend.agents.extractor import IngestionExtractor
from backend.agents.reconciler import ReconciliationAgent
from backend.agents.hitl import HITLAgent
from backend.agents.analytics import AnalyticsQueryAgent
from backend.observability.tracer import Tracer
from backend.db.database import get_db_connection

# -------------------------------------------------------------
# Node Implementations
# -------------------------------------------------------------

def supervisor_router_node(state: AgentState) -> Dict[str, Any]:
    """Inspects input type and routes payload accordingly."""
    start = datetime.now()
    raw_type = state.get("raw_input_type", "nl_expense")
    raw_content = state.get("raw_content", "")
    
    # Simple semantic heuristic if raw_input_type is generic
    if raw_type in ["nl_expense", "chat"]:
        # If the text has question words, route to analytics
        text_str = str(raw_content).lower()
        if any(w in text_str for w in ["why", "how much", "which", "what", "where", "?", "list", "show"]):
            raw_type = "nl_query"
        else:
            raw_type = "nl_expense"

    Tracer.log_span(
        trace_id=state["trace_id"],
        node_name="Supervisor Router",
        start_time=start,
        end_time=datetime.now(),
        prompt_tokens=150,
        completion_tokens=25,
        status="SUCCESS",
        prompt_text=f"Classifying input: '{str(raw_content)[:80]}'",
        response_text=f"Routed to input_type: {raw_type}"
    )
    return {"raw_input_type": raw_type}

def ingestion_extraction_node(state: AgentState) -> Dict[str, Any]:
    """Converts raw inputs (receipt image, CSV, text) into validated Pydantic records."""
    start = datetime.now()
    raw_type = state["raw_input_type"]
    raw_content = state["raw_content"]
    filename = state.get("filename", "unknown.jpg")

    extracted = []
    if raw_type == "receipt_image":
        contract = IngestionExtractor.parse_receipt_image(raw_content, filename)
        extracted.append(contract.model_dump())
    elif raw_type == "csv_file":
        records = IngestionExtractor.parse_csv_statement(str(raw_content))
        extracted.extend(records)
    else: # nl_expense
        contract = IngestionExtractor.parse_natural_language_expense(str(raw_content))
        extracted.append(contract.model_dump())

    tokens_in = 1200 if raw_type == "receipt_image" else 250
    tokens_out = 240 if raw_type == "receipt_image" else 80

    Tracer.log_span(
        trace_id=state["trace_id"],
        node_name="Ingestion & Extraction",
        start_time=start,
        end_time=datetime.now(),
        prompt_tokens=tokens_in,
        completion_tokens=tokens_out,
        status="SUCCESS",
        tool_name="parse_receipt_or_expense",
        tool_input_json=str(filename or raw_content)[:100],
        tool_output_json=str(extracted)[:200]
    )
    return {"extracted_records": extracted}

def reconciliation_anomaly_node(state: AgentState) -> Dict[str, Any]:
    """Cross-references candidate records against historical ledger for duplicates & refunds."""
    start = datetime.now()
    extracted = state.get("extracted_records", [])
    reconciled = []
    requires_hitl = False
    hitl_payload = None

    for item in extracted:
        # If this is already a full dictionary from CSV, evaluate or adapt to ExtractionContract
        if "total_amount" in item:
            contract = ExtractionContract(**item)
        else:
            contract = ExtractionContract(
                merchant_name=item.get("merchant_clean", "Merchant"),
                receipt_date=item.get("date", str(datetime.now().date())),
                total_amount=abs(float(item.get("amount", 1.0))),
                confidence_score=0.95,
                is_return_slip=(item.get("is_return", 0) == 1)
            )

        recon_contract = ReconciliationAgent.reconcile_candidate(contract, user_id=state.get("user_id"))
        reconciled.append(recon_contract.model_dump())

        if recon_contract.requires_human_review:
            requires_hitl = True
            card = HITLAgent.create_clarification_card(state["trace_id"], contract, recon_contract, user_id=state.get("user_id"))
            hitl_payload = card.model_dump()

    Tracer.log_span(
        trace_id=state["trace_id"],
        node_name="Reconciliation & Anomaly",
        start_time=start,
        end_time=datetime.now(),
        prompt_tokens=400,
        completion_tokens=120,
        status="SUCCESS",
        tool_name="reconcile_and_dedupe",
        response_text=f"requires_hitl: {requires_hitl}"
    )
    return {
        "reconciliation_results": reconciled,
        "requires_hitl": requires_hitl,
        "hitl_payload": hitl_payload
    }

def hitl_interrupt_node(state: AgentState) -> Dict[str, Any]:
    """Halts execution for Human-in-the-Loop review and sets pending status."""
    start = datetime.now()
    Tracer.log_span(
        trace_id=state["trace_id"],
        node_name="Human Clarification (HITL)",
        start_time=start,
        end_time=datetime.now(),
        prompt_tokens=80,
        completion_tokens=20,
        status="HITL_PAUSED",
        response_text="Execution paused awaiting human selection in UI"
    )
    payload = state.get("hitl_payload", {})
    return {
        "final_response": f"Action Required: {payload.get('prompt_title', 'Clarification needed')}. Please confirm your choice on the card."
    }

def database_commit_node(state: AgentState) -> Dict[str, Any]:
    """Commits verified and reconciled transactions into SQLite."""
    start = datetime.now()
    extracted = state.get("extracted_records", [])
    conn = get_db_connection()
    committed_count = 0
    from backend.db.database import DEMO_ADMIN_ID
    user_id = state.get("user_id") or DEMO_ADMIN_ID

    try:
        cursor = conn.cursor()
        for item in extracted:
            tx_id = str(uuid.uuid4())
            receipt_id = str(uuid.uuid4())
            m_name = item.get("merchant_name") or item.get("merchant_clean", "Merchant")
            m_date = item.get("receipt_date") or item.get("date", str(datetime.now().date()))
            amt = float(item.get("total_amount") or item.get("amount", 0.0))
            is_return = 1 if (item.get("is_return_slip") or item.get("is_return")) else 0
            cat = "General"
            if item.get("line_items") and len(item["line_items"]) > 0:
                cat = item["line_items"][0].get("category_hint", "General") or "General"
            
            # 1. Insert receipt record
            cursor.execute(
                """INSERT INTO receipts 
                   (id, user_id, merchant_name, receipt_date, subtotal, tax, tip, total_amount, confidence_score, is_return_slip)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (receipt_id, user_id, m_name, m_date, item.get("subtotal"), item.get("tax"), item.get("tip"), amt, item.get("confidence_score", 0.95), is_return)
            )

            # 2. Insert line items
            if item.get("line_items"):
                for li in item["line_items"]:
                    cursor.execute(
                        """INSERT INTO receipt_items (id, receipt_id, item_name, quantity, unit_price, total_price, category_hint)
                           VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        (str(uuid.uuid4()), receipt_id, li["name"], li.get("quantity", 1.0), li.get("unit_price"), li["total_price"], li.get("category_hint"))
                    )

            # 3. Insert transaction ledger entry
            cursor.execute(
                """INSERT INTO transactions 
                   (id, user_id, account_id, date, posted_date, merchant_raw, merchant_clean, amount, category, source, status, is_return, receipt_id, trace_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?)""",
                (tx_id, user_id, "acc_chase", m_date, m_date, m_name, m_name, -amt if is_return else amt, cat, "receipt_image" if item.get("line_items") else "manual_chat", is_return, receipt_id, state["trace_id"])
            )

            # 4. If return slip, track on Refund Radar
            if is_return:
                ret_id = str(uuid.uuid4())
                cursor.execute(
                    """INSERT INTO return_reconciliations 
                       (id, user_id, return_receipt_id, merchant_name, expected_amount, credited_amount, status, return_date, deadline_date)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (ret_id, user_id, receipt_id, m_name, amt, None, "awaiting_credit", m_date, str(datetime.now().date() + timedelta(days=10)))
                )

            committed_count += 1
        conn.commit()
    finally:
        conn.close()

    Tracer.log_span(
        trace_id=state["trace_id"],
        node_name="Database Commit",
        start_time=start,
        end_time=datetime.now(),
        prompt_tokens=50,
        completion_tokens=15,
        status="SUCCESS",
        response_text=f"Committed {committed_count} verified record(s)"
    )

    first_item = extracted[0] if extracted else {}
    m_name = first_item.get("merchant_name") or first_item.get("merchant_clean", "Merchant")
    amt = first_item.get("total_amount") or first_item.get("amount", 0.0)
    
    return {
        "final_response": f"Successfully verified and logged expense of ${float(amt):.2f} at {m_name}."
    }

def analytics_query_node(state: AgentState) -> Dict[str, Any]:
    """Generates and executes read-only deterministic SQL for analytical questions."""
    start = datetime.now()
    question = str(state["raw_content"])
    contract = AnalyticsQueryAgent.answer_spending_query(question, user_id=state.get("user_id"))

    Tracer.log_span(
        trace_id=state["trace_id"],
        node_name="Analytics & Safe SQL",
        start_time=start,
        end_time=datetime.now(),
        prompt_tokens=650,
        completion_tokens=180,
        status="SUCCESS",
        tool_name="execute_safe_readonly_sql",
        tool_input_json=contract.executed_sql,
        tool_output_json=str(contract.record_results)[:200]
    )
    return {
        "analytics_output": contract.model_dump(),
        "final_response": contract.natural_language_explanation
    }

# -------------------------------------------------------------
# Conditional Edge Routers
# -------------------------------------------------------------

def route_after_supervisor(state: AgentState) -> Literal["analytics_query_node", "ingestion_extraction_node"]:
    if state["raw_input_type"] == "nl_query":
        return "analytics_query_node"
    return "ingestion_extraction_node"

def route_after_reconciliation(state: AgentState) -> Literal["hitl_interrupt_node", "database_commit_node"]:
    if state.get("requires_hitl", False):
        return "hitl_interrupt_node"
    return "database_commit_node"

# -------------------------------------------------------------
# Build and Compile StateGraph
# -------------------------------------------------------------

def build_spendtrace_graph():
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("supervisor_router_node", supervisor_router_node)
    workflow.add_node("ingestion_extraction_node", ingestion_extraction_node)
    workflow.add_node("reconciliation_anomaly_node", reconciliation_anomaly_node)
    workflow.add_node("hitl_interrupt_node", hitl_interrupt_node)
    workflow.add_node("database_commit_node", database_commit_node)
    workflow.add_node("analytics_query_node", analytics_query_node)

    # Set Entry Point
    workflow.set_entry_point("supervisor_router_node")

    # Add Conditional Edges
    workflow.add_conditional_edges(
        "supervisor_router_node",
        route_after_supervisor,
        {
            "analytics_query_node": "analytics_query_node",
            "ingestion_extraction_node": "ingestion_extraction_node"
        }
    )

    workflow.add_edge("ingestion_extraction_node", "reconciliation_anomaly_node")

    workflow.add_conditional_edges(
        "reconciliation_anomaly_node",
        route_after_reconciliation,
        {
            "hitl_interrupt_node": "hitl_interrupt_node",
            "database_commit_node": "database_commit_node"
        }
    )

    workflow.add_edge("hitl_interrupt_node", END)
    workflow.add_edge("database_commit_node", END)
    workflow.add_edge("analytics_query_node", END)

    # Use MemorySaver checkpointer for thread persistence
    checkpointer = MemorySaver()
    app = workflow.compile(checkpointer=checkpointer)
    return app

# Singleton compiled app
spendtrace_agent = build_spendtrace_graph()
