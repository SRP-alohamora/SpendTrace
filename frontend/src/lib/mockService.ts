// Mock & In-Browser Simulation Service for GitHub Pages
// Ensures that visitors to the GitHub Pages static deployment experience a 100% interactive,
// functional, and visually impressive demonstration of SpendTrace without needing a live backend.

export const MOCK_ADMIN_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@spendtrace.ai",
  role: "admin",
  full_name: "Admin User"
};

export const MOCK_NEW_USER = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "newuser@spendtrace.ai",
  role: "member",
  full_name: "New User"
};

export const MOCK_BENCHMARK_TRANSACTIONS = [
  {
    id: "7c0b08c9-09bc-43e4-9db6-483633c26e34",
    date: "2026-10-13",
    merchant_clean: "Nobu",
    merchant_raw: "NOBU DOWNTOWN NYC",
    amount: 145.00,
    category: "Dining",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-10-13T20:15:00Z"
  },
  {
    id: "623a172b-9175-4f84-8960-a1c7091e6319",
    date: "2026-10-17",
    merchant_clean: "Osteria",
    merchant_raw: "OSTERIA MORINI",
    amount: 68.50,
    category: "Dining",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-10-17T19:40:00Z"
  },
  {
    id: "fa06006a-eed0-4a5f-a8ba-759258aa5069",
    date: "2026-10-20",
    merchant_clean: "Blue Ribbon",
    merchant_raw: "BLUE RIBBON SUSHI",
    amount: 48.00,
    category: "Dining",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-10-20T13:20:00Z"
  },
  {
    id: "19d4b0a1-4328-444a-a92e-3286bf5ea56b",
    date: "2026-10-24",
    merchant_clean: "Trader Joe's",
    merchant_raw: "TRADER JOES #542",
    amount: 42.18,
    category: "Groceries",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-10-24T14:10:00Z"
  },
  {
    id: "9c3e120a-7b31-4cf1-8c4d-91b53e8a4911",
    date: "2026-10-18",
    merchant_clean: "Target",
    merchant_raw: "TARGET T-0921",
    amount: 84.20,
    category: "Home & Supplies",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-10-18T16:30:00Z"
  },
  {
    id: "e0725fdf-6be6-4fdb-938b-aa6cc9cd1cce",
    date: "2026-10-11",
    merchant_clean: "Zara",
    merchant_raw: "ZARA USA #121 RETURN",
    amount: 89.00,
    category: "Apparel",
    status: "awaiting_credit",
    is_return: 1,
    has_receipt: true,
    created_at: "2026-10-11T11:00:00Z"
  },
  {
    id: "3d5f812b-34a8-449e-b141-8c772b14e912",
    date: "2026-10-05",
    merchant_clean: "Apple Store",
    merchant_raw: "APPLE STORE R142",
    amount: 199.00,
    category: "Electronics",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-10-05T15:00:00Z"
  },
  {
    id: "aa112233-4455-6677-8899-aabbccddeeff",
    date: "2026-10-24",
    merchant_clean: "Joe's Diner",
    merchant_raw: "JOES DINER BROOKLYN",
    amount: 18.50,
    category: "Dining",
    status: "needs_review",
    is_return: 0,
    has_receipt: false,
    created_at: "2026-10-24T12:05:00Z"
  },
  {
    id: "aa112233-4455-6677-8899-aabbccddee00",
    date: "2026-10-24",
    merchant_clean: "Joe's Diner",
    merchant_raw: "JOES DINER BROOKLYN",
    amount: 18.50,
    category: "Dining",
    status: "duplicate",
    is_return: 0,
    has_receipt: false,
    created_at: "2026-10-24T12:06:00Z"
  },
  {
    id: "8f7e6d5c-4b3a-210f-9e8d-7c6b5a493821",
    date: "2026-10-09",
    merchant_clean: "Shell",
    merchant_raw: "SHELL OIL 574421",
    amount: 52.10,
    category: "Fuel",
    status: "verified",
    is_return: 0,
    has_receipt: false,
    created_at: "2026-10-09T08:30:00Z"
  },
  {
    id: "1a2b3c4d-5e6f-7081-92a3-b4c5d6e7f809",
    date: "2026-09-28",
    merchant_clean: "Whole Foods",
    merchant_raw: "WHOLEFDS MKT #1029",
    amount: 34.80,
    category: "Groceries",
    status: "verified",
    is_return: 0,
    has_receipt: true,
    created_at: "2026-09-28T17:45:00Z"
  }
];

export const MOCK_REFUNDS = [
  {
    id: "e0725fdf-6be6-4fdb-938b-aa6cc9cd1cce",
    merchant_name: "Zara",
    expected_amount: 89.00,
    status: "overdue_alert",
    return_date: "2026-10-11",
    deadline_date: "2026-10-21",
    days_pending: 14,
    notes: "Zara jacket returned at Soho store. Tracking voucher verified.",
    item_description: "Structured Wool Blend Oversized Coat (Size M)"
  }
];

export const MOCK_EVAL_DATA = {
  run_id: "eval_run_94b1a37c",
  timestamp: "2026-10-25T19:30:00Z",
  total_tests: 70,
  passed_tests: 66,
  failed_tests: 4,
  accuracy_rate: 0.943,
  p95_latency_ms: 1280,
  average_latency_ms: 610,
  total_cost_usd: 0.0384,
  model_name: "gemini-2.0-flash (Tiered)",
  results: [
    {
      test_id: "test_receipt_01_trader_joes",
      name: "Trader Joe's Receipt Extraction",
      category: "receipt_extraction",
      status: "PASS",
      latency_ms: 920,
      cost_usd: 0.00034,
      ground_truth: {
        merchant: "Trader Joe's",
        total: 42.18,
        items_count: 4,
        date: "2026-10-24"
      },
      predicted: {
        merchant: "Trader Joe's",
        total: 42.18,
        items_count: 4,
        date: "2026-10-24"
      }
    },
    {
      test_id: "test_reconcile_duplicate_detection",
      name: "Duplicate Swipe Detection (Joe's Diner)",
      category: "reconciliation",
      status: "PASS",
      latency_ms: 480,
      cost_usd: 0.00012,
      ground_truth: {
        action: "interrupt_hitl",
        is_duplicate: true,
        candidate_count: 2
      },
      predicted: {
        action: "interrupt_hitl",
        is_duplicate: true,
        candidate_count: 2
      }
    },
    {
      test_id: "test_refund_radar_overdue_flag",
      name: "Orphan Return Detection (>10 Days)",
      category: "refund_radar",
      status: "PASS",
      latency_ms: 310,
      cost_usd: 0.00008,
      ground_truth: {
        merchant: "Zara",
        overdue: true,
        days_uncredited: 14
      },
      predicted: {
        merchant: "Zara",
        overdue: true,
        days_uncredited: 14
      }
    },
    {
      test_id: "test_nl_to_sql_spending_increase",
      name: "Grounded Spending Increase SQL Query",
      category: "nl_to_sql",
      status: "PASS",
      latency_ms: 220,
      cost_usd: 0.00011,
      ground_truth: {
        category_increase: "Dining",
        difference: 116.50,
        cited_ids_count: 3
      },
      predicted: {
        category_increase: "Dining",
        difference: 116.50,
        cited_ids_count: 3
      }
    }
  ]
};

export const MOCK_TRACES = [
  {
    id: "tr_11d25991",
    user_id: "00000000-0000-0000-0000-000000000001",
    action_type: "chat_analytics_query",
    status: "completed",
    duration_ms: 382,
    total_tokens: 412,
    estimated_cost_usd: 0.00014,
    created_at: "2026-10-25T20:56:23Z",
    summary: "Why did my spending increase this month?",
    spans: [
      {
        span_id: "sp_01",
        span_name: "Router & Intent Classification",
        node: "supervisor",
        duration_ms: 110,
        tokens: 154,
        cost_usd: 0.00004
      },
      {
        span_id: "sp_02",
        span_name: "Safe Read-Only SQL Generation",
        node: "analytics_coder",
        duration_ms: 215,
        tokens: 220,
        cost_usd: 0.00008
      },
      {
        span_id: "sp_03",
        span_name: "Deterministic DB Execution & Grounding",
        node: "db_sandbox",
        duration_ms: 57,
        tokens: 38,
        cost_usd: 0.00002
      }
    ]
  },
  {
    id: "tr_8c41f92e",
    user_id: "00000000-0000-0000-0000-000000000001",
    action_type: "receipt_multimodal_extraction",
    status: "completed",
    duration_ms: 1620,
    total_tokens: 1140,
    estimated_cost_usd: 0.00038,
    created_at: "2026-10-25T20:48:10Z",
    summary: "Ingest receipt_trader_joes.jpg",
    spans: [
      {
        span_id: "sp_11",
        span_name: "Multimodal Vision OCR (Gemini 2.0 Flash)",
        node: "extractor",
        duration_ms: 1240,
        tokens: 950,
        cost_usd: 0.00032
      },
      {
        span_id: "sp_12",
        span_name: "Reconciliation & Deduplication Check",
        node: "reconciler",
        duration_ms: 260,
        tokens: 140,
        cost_usd: 0.00004
      },
      {
        span_id: "sp_13",
        span_name: "PostgreSQL Database Commit",
        node: "db_commit",
        duration_ms: 120,
        tokens: 50,
        cost_usd: 0.00002
      }
    ]
  }
];

export const MOCK_OBS_METRICS = {
  total_traces: 142,
  average_latency_ms: 480,
  p95_latency_ms: 1420,
  total_tokens: 98450,
  total_cost_usd: 0.0342,
  cache_hit_rate: 0.38,
  error_rate: 0.00
};

// Check if running on GitHub Pages
export function isGitHubPagesDeployment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
}

// In-browser mock responses for chat
export function handleMockChatResponse(message: string): any {
  const lower = message.toLowerCase();

  if (lower.includes('increase') || lower.includes('dining') || lower.includes('spending')) {
    return {
      response: "Your spending increased in October primarily because **Dining** spending grew by **$116.50** compared to September. The top driving purchases were:\n• Nobu on 2026-10-13 ($145.00)\n• Osteria on 2026-10-17 ($68.50)\n• Blue Ribbon on 2026-10-20 ($48.00)",
      requires_hitl: false,
      hitl_payload: null,
      analytics: {
        natural_language_explanation: "Your spending increased in October primarily because **Dining** spending grew by **$116.50** compared to September. The top driving purchases were:\n• Nobu on 2026-10-13 ($145.00)\n• Osteria on 2026-10-17 ($68.50)\n• Blue Ribbon on 2026-10-20 ($48.00)",
        executed_sql: "SELECT category, SUM(CASE WHEN strftime('%Y-%m', date) = '2026-10' THEN amount ELSE 0 END) as cur_spend, SUM(CASE WHEN strftime('%Y-%m', date) = '2026-09' THEN amount ELSE 0 END) as prev_spend FROM transactions WHERE is_return = 0 AND status != 'deleted' GROUP BY category ORDER BY (cur_spend - prev_spend) DESC",
        record_results: [
          { id: "7c0b08c9-09bc-43e4-9db6-483633c26e34", date: "2026-10-13", merchant_clean: "Nobu", amount: 145.00, category: "Dining" },
          { id: "623a172b-9175-4f84-8960-a1c7091e6319", date: "2026-10-17", merchant_clean: "Osteria", amount: 68.50, category: "Dining" },
          { id: "fa06006a-eed0-4a5f-a8ba-759258aa5069", date: "2026-10-20", merchant_clean: "Blue Ribbon", amount: 48.00, category: "Dining" }
        ],
        cited_transaction_ids: [
          "7c0b08c9-09bc-43e4-9db6-483633c26e34",
          "623a172b-9175-4f84-8960-a1c7091e6319",
          "fa06006a-eed0-4a5f-a8ba-759258aa5069"
        ],
        calculated_aggregates: { category_increase: 116.50 },
        execution_duration_ms: 1.43
      }
    };
  }

  if (lower.includes('refund') || lower.includes('return') || lower.includes('radar')) {
    return {
      response: "You have **1** active return(s) awaiting credit:\n• **Zara**: $89.00 returned on 2026-10-11 (🔴 OVERDUE)\n\n*Items marked Overdue have passed the 10-day settlement window. You should contact the merchant or dispute with your bank.*",
      requires_hitl: false,
      hitl_payload: null,
      analytics: {
        natural_language_explanation: "You have 1 active return awaiting credit: Zara ($89.00, returned 2026-10-11, 14 days pending - OVERDUE).",
        executed_sql: "SELECT id, merchant_name, expected_amount, status, return_date, deadline_date FROM return_reconciliations WHERE status IN ('overdue_alert', 'awaiting_credit') ORDER BY return_date ASC",
        record_results: [
          { id: "e0725fdf-6be6-4fdb-938b-aa6cc9cd1cce", merchant_name: "Zara", expected_amount: 89.00, status: "overdue_alert", return_date: "2026-10-11", deadline_date: "2026-10-21" }
        ],
        cited_transaction_ids: ["e0725fdf-6be6-4fdb-938b-aa6cc9cd1cce"],
        calculated_aggregates: { uncollected_refunds_count: 1 },
        execution_duration_ms: 0.62
      }
    };
  }

  // Default conversational expense parse simulation
  const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 24.50;
  return {
    response: `Logged expense of **$${amount.toFixed(2)}** to your master ledger. Itemized details extracted and saved to persistent database.`,
    requires_hitl: false,
    hitl_payload: null,
    analytics: null
  };
}
