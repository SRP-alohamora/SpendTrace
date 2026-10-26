from typing import Annotated, List, Dict, Any, Optional, Literal
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
import operator

# =====================================================================
# Strict Pydantic Data Contracts (Between Resources, Assets & Agents)
# =====================================================================

class LineItemContract(BaseModel):
    name: str = Field(description="Name or description of purchased item")
    quantity: float = Field(default=1.0, ge=0.01)
    unit_price: Optional[float] = Field(default=None, ge=0.0)
    total_price: float = Field(description="Total line price")
    category_hint: Optional[str] = Field(default=None)

class ExtractionContract(BaseModel):
    merchant_name: str = Field(description="Normalized merchant name")
    receipt_date: str = Field(description="Transaction date on receipt (YYYY-MM-DD)")
    subtotal: Optional[float] = Field(default=None, ge=0.0)
    tax: Optional[float] = Field(default=None, ge=0.0)
    tip: Optional[float] = Field(default=None, ge=0.0)
    total_amount: float = Field(gt=0.0, description="Gross total amount")
    payment_method_last4: Optional[str] = Field(default=None, max_length=4)
    is_return_slip: bool = Field(default=False)
    confidence_score: float = Field(ge=0.0, le=1.0)
    line_items: List[LineItemContract] = Field(default_factory=list)

    @field_validator("total_amount")
    def validate_total(cls, v):
        return round(float(v), 2)

class ReconciliationAnomalyContract(BaseModel):
    relationship_type: Literal[
        "unique_new",
        "duplicate_charge",
        "statement_match",
        "return_credit_matched",
        "orphan_return"
    ]
    matched_transaction_id: Optional[str] = None
    matched_receipt_id: Optional[str] = None
    match_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    requires_human_review: bool = False
    conflict_reason: Optional[str] = None
    proposed_actions: List[str] = Field(default_factory=list)

class OptionChoice(BaseModel):
    id: str
    label: str
    action_type: Literal["merge", "keep_separate", "edit_fields", "dismiss"]
    is_recommended: bool = False

class HITLInterruptContract(BaseModel):
    interrupt_id: str
    trace_id: str
    issue_type: Literal["low_confidence_ocr", "suspected_duplicate", "orphan_return", "destructive_action"]
    prompt_title: str
    prompt_message: str
    selectable_options: List[OptionChoice]
    diff_payload: Dict[str, Any] = Field(default_factory=dict)

class HITLResolutionContract(BaseModel):
    interrupt_id: str
    selected_option_id: str
    user_overrides: Optional[Dict[str, Any]] = None
    user_notes: Optional[str] = None

class AnalyticsResponseContract(BaseModel):
    natural_language_explanation: str
    executed_sql: str
    record_results: List[Dict[str, Any]] = Field(default_factory=list)
    cited_transaction_ids: List[str] = Field(default_factory=list)
    calculated_aggregates: Dict[str, float] = Field(default_factory=dict)
    execution_duration_ms: float = 0.0

# =====================================================================
# LangGraph Stateful Agent State Schema
# =====================================================================

class AgentState(TypedDict):
    # Tracing & Context
    trace_id: str
    session_id: str
    user_id: Optional[str]
    
    # User Input
    raw_input_type: Literal["receipt_image", "csv_file", "nl_expense", "nl_query", "hitl_resume"]
    raw_content: Any
    filename: Optional[str]
    
    # Conversational Messages
    messages: Annotated[List[Dict[str, Any]], operator.add]
    
    # Sub-agent states
    extracted_records: List[Dict[str, Any]]
    reconciliation_results: List[Dict[str, Any]]
    
    # Human-in-the-Loop Flags & Interruption
    requires_hitl: bool
    hitl_payload: Optional[Dict[str, Any]]
    hitl_resolution: Optional[Dict[str, Any]]
    
    # Analytics / SQL outputs
    generated_sql: Optional[str]
    sql_records: Optional[List[Dict[str, Any]]]
    analytics_output: Optional[Dict[str, Any]]
    
    # Final response to user
    final_response: str
    error: Optional[str]
