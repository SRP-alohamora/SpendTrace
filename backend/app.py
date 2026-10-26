import os
import uuid
import json
from io import StringIO
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from backend.agents.graph import spendtrace_agent
from backend.agents.state import HITLResolutionContract
from backend.agents.hitl import HITLAgent
from backend.db.database import (
    init_db,
    get_ledger_transactions,
    get_refund_radar_items,
    get_clarification_queue,
    get_db_connection,
    clear_user_data,
    seed_sample_data_for_user,
    DEMO_ADMIN_ID,
    DEMO_MEMBER_ID
)
from backend.auth.supabase_auth import (
    register_user,
    login_user,
    get_current_user,
    require_admin,
    switch_user_role,
    SUPABASE_URL,
    SUPABASE_ANON_KEY
)
from backend.observability.tracer import Tracer
from backend.evals.runner import run_evaluation_suite, get_latest_eval_run, get_all_eval_runs

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(seed_sample_data=True)
    yield

# Initialize FastAPI App with OpenAPI documentation
app = FastAPI(
    title="SpendTrace API",
    description="Agentic AI Expense & Purchase Intelligence Engine with Supabase Open Source Auth, IAM, and PostgreSQL",
    version="1.3.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "app": "SpendTrace",
        "version": "1.3.0",
        "auth_provider": "Supabase Open Source Auth (GoTrue)",
        "iam_enabled": True
    }

# =============================================================
# Supabase Open Source Auth & IAM Endpoints
# Compatible with https://github.com/SRP-alohamora/supabase-opensrc-auth
# =============================================================

@app.get("/api/v1/auth/config")
def get_auth_config():
    """Returns public Supabase Auth connection parameters for client initialization."""
    return {
        "supabase_url": SUPABASE_URL,
        "supabase_anon_key": SUPABASE_ANON_KEY,
        "provider": "supabase-opensrc-auth",
        "iam_roles": ["admin", "member"]
    }

@app.post("/api/v1/auth/signup")
def auth_signup(payload: Dict[str, Any]):
    """
    Registers a new user account.
    CRITICAL REQUIREMENT: For a new user, ALWAYS START CLEAN.
    New users start with 0 transactions, 0 receipts, and 0 refund items.
    """
    email = payload.get("email", "").strip()
    password = payload.get("password", "").strip()
    full_name = payload.get("full_name")
    role = payload.get("role", "member")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    return register_user(email=email, password=password, role=role, full_name=full_name)

@app.post("/api/v1/auth/login")
def auth_login(payload: Dict[str, Any]):
    """Authenticates credentials against Supabase Open Source Auth."""
    email = payload.get("email", "").strip()
    password = payload.get("password", "").strip()
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    return login_user(email=email, password=password)

@app.get("/api/v1/auth/me")
def auth_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns profile and IAM permissions for currently authenticated user."""
    return {
        "user": current_user,
        "is_admin": current_user.get("role") == "admin",
        "permissions": {
            "can_access_ledger": True,
            "can_upload": True,
            "can_access_radar": True,
            "can_run_evals": current_user.get("role") == "admin",
            "can_view_traces": current_user.get("role") == "admin"
        }
    }

@app.post("/api/v1/auth/switch-role")
def auth_switch_role(payload: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    """Allows toggling IAM role between 'admin' and 'member' for live demonstration."""
    new_role = payload.get("role", "member")
    return switch_user_role(current_user["id"], new_role)

@app.post("/api/v1/auth/clean-slate")
def reset_clean_slate(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Resets the current user's ledger back to a completely clean slate (0 records)."""
    clear_user_data(current_user["id"])
    return {"status": "ok", "message": "User ledger reset to clean slate (0 transactions)."}

@app.post("/api/v1/auth/seed-demo")
def seed_demo(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Allows a new user to populate sample demo data if desired."""
    seed_sample_data_for_user(current_user["id"])
    return {"status": "ok", "message": "Sample transaction loaded into your personal ledger."}

# =============================================================
# Agent Interaction Endpoints (Scoped to current user)
# =============================================================

@app.post("/api/v1/agent/chat")
async def agent_chat(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    message = payload.get("message", "").strip()
    session_id = payload.get("session_id", "default_session")
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    trace_id = f"tr_{uuid.uuid4().hex[:8]}"
    Tracer.start_trace(trace_id, message, "chat", user_id=current_user["id"])

    initial_state = {
        "trace_id": trace_id,
        "session_id": session_id,
        "user_id": current_user["id"],
        "raw_input_type": "nl_expense",
        "raw_content": message,
        "filename": None,
        "messages": [{"role": "user", "content": message}],
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

    try:
        output = spendtrace_agent.invoke(
            initial_state,
            {"configurable": {"thread_id": f"thread_{session_id}_{current_user['id']}"}}
        )
        status = "HITL_INTERRUPT" if output.get("requires_hitl") else "SUCCESS"
        Tracer.end_trace(trace_id, status)

        return {
            "trace_id": trace_id,
            "response": output.get("final_response", ""),
            "requires_hitl": output.get("requires_hitl", False),
            "hitl_payload": output.get("hitl_payload"),
            "analytics": output.get("analytics_output")
        }
    except Exception as e:
        Tracer.end_trace(trace_id, "FAILED")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/agent/ingest-receipt")
async def ingest_receipt(
    file: UploadFile = File(...),
    session_id: str = Form("default_session"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    contents = await file.read()
    trace_id = f"tr_{uuid.uuid4().hex[:8]}"
    Tracer.start_trace(trace_id, f"Uploaded Receipt: {file.filename}", "receipt_upload", user_id=current_user["id"])

    initial_state = {
        "trace_id": trace_id,
        "session_id": session_id,
        "user_id": current_user["id"],
        "raw_input_type": "receipt_image",
        "raw_content": contents,
        "filename": file.filename,
        "messages": [{"role": "user", "content": f"Uploaded receipt: {file.filename}"}],
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

    try:
        output = spendtrace_agent.invoke(
            initial_state,
            {"configurable": {"thread_id": f"thread_{session_id}_{current_user['id']}"}}
        )
        status = "HITL_INTERRUPT" if output.get("requires_hitl") else "SUCCESS"
        Tracer.end_trace(trace_id, status)

        return {
            "trace_id": trace_id,
            "response": output.get("final_response", ""),
            "extracted": output.get("extracted_records", []),
            "requires_hitl": output.get("requires_hitl", False),
            "hitl_payload": output.get("hitl_payload")
        }
    except Exception as e:
        Tracer.end_trace(trace_id, "FAILED")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/agent/ingest-csv")
async def ingest_csv(
    file: UploadFile = File(...),
    session_id: str = Form("default_session"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    raw_bytes = await file.read()
    csv_text = raw_bytes.decode("utf-8", errors="ignore")
    trace_id = f"tr_{uuid.uuid4().hex[:8]}"
    Tracer.start_trace(trace_id, f"Imported CSV: {file.filename}", "csv_import", user_id=current_user["id"])

    initial_state = {
        "trace_id": trace_id,
        "session_id": session_id,
        "user_id": current_user["id"],
        "raw_input_type": "csv_file",
        "raw_content": csv_text,
        "filename": file.filename,
        "messages": [{"role": "user", "content": f"Uploaded statement: {file.filename}"}],
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

    try:
        output = spendtrace_agent.invoke(
            initial_state,
            {"configurable": {"thread_id": f"thread_{session_id}_{current_user['id']}"}}
        )
        status = "HITL_INTERRUPT" if output.get("requires_hitl") else "SUCCESS"
        Tracer.end_trace(trace_id, status)

        return {
            "trace_id": trace_id,
            "response": output.get("final_response", ""),
            "records_count": len(output.get("extracted_records", [])),
            "requires_hitl": output.get("requires_hitl", False),
            "hitl_payload": output.get("hitl_payload")
        }
    except Exception as e:
        Tracer.end_trace(trace_id, "FAILED")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/agent/resolve-clarification")
def resolve_clarification(payload: HITLResolutionContract, current_user: Dict[str, Any] = Depends(get_current_user)):
    res = HITLAgent.resolve_clarification(payload)
    return res

# =============================================================
# Ledger & Refund Radar Endpoints (Scoped per user)
# =============================================================

@app.get("/api/v1/transactions")
def list_transactions(
    category: Optional[str] = None,
    limit: int = 100,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns transactions belonging strictly to the current user.
    For a new user, this returns an empty list (0 records).
    """
    txs = get_ledger_transactions(user_id=current_user["id"], limit=limit, category=category)
    return {
        "transactions": txs,
        "count": len(txs),
        "user_id": current_user["id"],
        "is_clean_slate": len(txs) == 0
    }

@app.get("/api/v1/refunds/radar")
def list_refunds(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns return reconciliations for current user."""
    refunds = get_refund_radar_items(user_id=current_user["id"])
    overdue_count = sum(1 for r in refunds if r["status"] == "overdue_alert")
    return {"refunds": refunds, "overdue_count": overdue_count, "user_id": current_user["id"]}

@app.get("/api/v1/clarifications")
def list_clarifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    queue = get_clarification_queue(user_id=current_user["id"])
    return {"clarifications": queue, "count": len(queue), "user_id": current_user["id"]}

@app.get("/api/v1/export")
def export_csv(current_user: Dict[str, Any] = Depends(get_current_user)):
    txs = get_ledger_transactions(user_id=current_user["id"], limit=1000)
    output = StringIO()
    import csv
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Merchant", "Amount", "Category", "Status", "Source"])
    for t in txs:
        writer.writerow([t["id"], t["date"], t["merchant_clean"], t["amount"], t["category"], t["status"], t["source"]])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=spendtrace_ledger_{current_user['email'].split('@')[0]}.csv"}
    )

# =============================================================
# Continuous Evals & Observability Endpoints (Guarded by IAM Admin)
# =============================================================

@app.post("/api/v1/evals/run")
def trigger_evals(
    suite: str = Query("full_benchmark"),
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    IAM Guarded: Requires Admin Role.
    Executes automated model evaluation test harness.
    """
    res = run_evaluation_suite(suite_name=suite)
    return res

@app.get("/api/v1/evals/latest")
def get_latest_eval(admin_user: Dict[str, Any] = Depends(require_admin)):
    run = get_latest_eval_run()
    if not run:
        run = run_evaluation_suite()
    return run

@app.get("/api/v1/evals/history")
def get_eval_history(admin_user: Dict[str, Any] = Depends(require_admin)):
    runs = get_all_eval_runs()
    return {"history": runs}

@app.get("/api/v1/observability/traces")
def get_traces(
    limit: int = 50,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """IAM Guarded: Requires Admin Role. Returns execution spans and telemetry."""
    traces = Tracer.get_recent_traces(limit=limit)
    return {"traces": traces}

@app.get("/api/v1/observability/traces/{trace_id}")
def get_trace_detail(
    trace_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    details = Tracer.get_trace_details(trace_id)
    if not details:
        raise HTTPException(status_code=404, detail="Trace not found")
    return details

@app.get("/api/v1/observability/metrics")
def get_telemetry_metrics(admin_user: Dict[str, Any] = Depends(require_admin)):
    return Tracer.get_metrics_summary()

# Mount built frontend static files if available
from pathlib import Path
from fastapi.staticfiles import StaticFiles

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
