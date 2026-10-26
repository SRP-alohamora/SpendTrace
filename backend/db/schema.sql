-- SpendTrace Relational Database Schema
-- Multi-Tenant SQLite with WAL Mode & User Isolation
-- Mirrors PostgreSQL / Supabase Schema for clean multi-user state

-- 0. Users Table (IAM Authentication & Authorization)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'member',  -- 'admin' or 'member'
    full_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. Accounts Table (Scoped to user_id)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL,          -- 'credit', 'checking', 'savings', 'cash'
    last_four TEXT,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Transactions Ledger (Scoped to user_id)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(id),
    date DATE NOT NULL,
    posted_date DATE,
    merchant_raw TEXT NOT NULL,
    merchant_clean TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,      -- Positive = Expense, Negative = Credit/Refund
    category TEXT NOT NULL,
    source TEXT NOT NULL,                -- 'csv_statement', 'receipt_image', 'manual_chat'
    status TEXT NOT NULL,                -- 'verified', 'pending_review', 'reconciled'
    is_return BOOLEAN DEFAULT 0,
    receipt_id TEXT REFERENCES receipts(id),
    matched_transaction_id TEXT REFERENCES transactions(id),
    trace_id TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Receipts & Invoices (Scoped to user_id)
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path TEXT,
    merchant_name TEXT NOT NULL,
    receipt_date DATE NOT NULL,
    subtotal NUMERIC(10, 2),
    tax NUMERIC(10, 2),
    tip NUMERIC(10, 2),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method_last4 TEXT,
    confidence_score NUMERIC(3, 2),
    is_return_slip BOOLEAN DEFAULT 0,
    raw_ocr_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Itemized Receipt Line Items
CREATE TABLE IF NOT EXISTS receipt_items (
    id TEXT PRIMARY KEY,
    receipt_id TEXT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity NUMERIC(6, 2) DEFAULT 1.0,
    unit_price NUMERIC(10, 2),
    total_price NUMERIC(10, 2) NOT NULL,
    category_hint TEXT
);

-- 5. Refund Radar (Return Reconciliation - Scoped to user_id)
CREATE TABLE IF NOT EXISTS return_reconciliations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    return_receipt_id TEXT REFERENCES receipts(id),
    original_transaction_id TEXT REFERENCES transactions(id),
    credit_transaction_id TEXT REFERENCES transactions(id),
    merchant_name TEXT NOT NULL,
    expected_amount NUMERIC(10, 2) NOT NULL,
    credited_amount NUMERIC(10, 2),
    status TEXT NOT NULL,                -- 'awaiting_credit', 'reconciled', 'overdue_alert'
    return_date DATE NOT NULL,
    deadline_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Human Clarification Queue (Scoped to user_id)
CREATE TABLE IF NOT EXISTS clarification_queue (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,           -- 'transaction', 'receipt', 'duplicate_pair', 'orphan_return'
    entity_id TEXT NOT NULL,
    issue_type TEXT NOT NULL,            -- 'low_confidence_ocr', 'suspected_duplicate', 'orphan_return'
    prompt_question TEXT NOT NULL,
    options_json TEXT NOT NULL,          -- JSON array of choices
    diff_payload_json TEXT,
    resolved BOOLEAN DEFAULT 0,
    resolution_choice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Continuous Evaluation Runs (Scoped to user_id)
CREATE TABLE IF NOT EXISTS eval_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    suite_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    total_tests INTEGER NOT NULL,
    passed_tests INTEGER NOT NULL,
    failed_tests INTEGER NOT NULL,
    accuracy_percentage NUMERIC(5, 2) NOT NULL,
    avg_duration_ms INTEGER NOT NULL,
    total_cost_usd NUMERIC(8, 5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Individual Evaluation Test Results
CREATE TABLE IF NOT EXISTS eval_results (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
    test_id TEXT NOT NULL,
    test_name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,                -- 'PASS', 'FAIL'
    duration_ms INTEGER NOT NULL,
    token_cost_usd NUMERIC(8, 5) NOT NULL,
    ground_truth_json TEXT NOT NULL,
    predicted_json TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Observability Traces (Scoped to user_id)
CREATE TABLE IF NOT EXISTS traces (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_query TEXT,
    input_type TEXT NOT NULL,            -- 'chat', 'receipt_upload', 'csv_import', 'eval_run'
    status TEXT NOT NULL,                -- 'SUCCESS', 'HITL_INTERRUPT', 'FAILED'
    total_duration_ms INTEGER NOT NULL,
    total_prompt_tokens INTEGER NOT NULL,
    total_completion_tokens INTEGER NOT NULL,
    total_cost_usd NUMERIC(8, 5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Observability Trace Spans
CREATE TABLE IF NOT EXISTS trace_spans (
    id TEXT PRIMARY KEY,
    trace_id TEXT NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    parent_span_id TEXT,
    node_name TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_ms INTEGER NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    cost_usd NUMERIC(8, 5) DEFAULT 0.0,
    status TEXT NOT NULL,
    prompt_text TEXT,
    response_text TEXT,
    tool_name TEXT,
    tool_input_json TEXT,
    tool_output_json TEXT,
    error_log TEXT
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_tx_merchant ON transactions(merchant_clean);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_return_user ON return_reconciliations(user_id);
CREATE INDEX IF NOT EXISTS idx_return_status ON return_reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_traces_created ON traces(created_at);
CREATE INDEX IF NOT EXISTS idx_spans_trace ON trace_spans(trace_id);
