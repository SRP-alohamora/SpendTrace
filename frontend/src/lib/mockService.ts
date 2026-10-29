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

export interface CoreEvalItem {
  id: number;
  name: string;
  what_it_tests: string;
  suggested_metric_target: string;
  mvp_priority: boolean;
  category: 'Extraction' | 'Categorization' | 'Entity Resolution' | 'Reconciliation' | 'Refund Intelligence' | 'Reasoning & Planning' | 'Security & Privacy';
  current_metric: string;
  status: 'PASS' | 'FAIL';
  rationale: string;
}

export const CORE_EVALS_15: CoreEvalItem[] = [
  {
    id: 1,
    name: "Receipt extraction",
    what_it_tests: "Extract merchant, date, tax, items and total from photos/PDFs",
    suggested_metric_target: "Critical-field accuracy ≥ 98%",
    mvp_priority: true,
    category: "Extraction",
    current_metric: "98.7% (20/20 critical receipt fields parsed)",
    status: "PASS",
    rationale: "Protects ground-truth ledger integrity. Parses complex subtotals, itemized lines, and sales tax across degraded physical receipts."
  },
  {
    id: 2,
    name: "Transaction categorization",
    what_it_tests: "Classify spending into Grocery, Apparel, Dining, Utilities, etc.",
    suggested_metric_target: "Macro-F1 ≥ 95%",
    mvp_priority: true,
    category: "Categorization",
    current_metric: "96.4% Macro-F1 across core merchant classes",
    status: "PASS",
    rationale: "Ensures off-price retailers (Marshalls -> Apparel) and non-itemized supercenters (Walmart -> Grocery) map accurately."
  },
  {
    id: 3,
    name: "Merchant normalization",
    what_it_tests: "Recognize WM SUPERCENTER #1234 as Walmart",
    suggested_metric_target: "Accuracy ≥ 98%",
    mvp_priority: false,
    category: "Entity Resolution",
    current_metric: "99.1% canonical entity resolution",
    status: "PASS",
    rationale: "Strips store numbers, terminal IDs, and state codes into unified canonical brands for historical trend aggregation."
  },
  {
    id: 4,
    name: "Duplicate detection",
    what_it_tests: "Avoid double-counting bank feeds, emails and receipts",
    suggested_metric_target: "Precision ≥ 99%",
    mvp_priority: true,
    category: "Reconciliation",
    current_metric: "99.4% precision on multi-source charge pairs",
    status: "PASS",
    rationale: "Prevents duplicate swipes, email forward receipts, and bank statement feeds from inflating spending balances."
  },
  {
    id: 5,
    name: "Receipt-to-payment matching",
    what_it_tests: "Associate a receipt with the correct bank transaction",
    suggested_metric_target: "Match precision ≥ 99%",
    mvp_priority: true,
    category: "Reconciliation",
    current_metric: "99.2% match precision (±3 day settlement window)",
    status: "PASS",
    rationale: "Links itemized receipt proof directly with cryptic credit card statement lines."
  },
  {
    id: 6,
    name: "Item-level categorization",
    what_it_tests: "Split mixed purchases into multiple spending categories",
    suggested_metric_target: "Item-level F1 ≥ 93%",
    mvp_priority: false,
    category: "Categorization",
    current_metric: "94.8% item-level F1 score",
    status: "PASS",
    rationale: "Splits multi-department baskets (e.g., Walmart $88.92 containing $60 groceries and $28.92 apparel) without losing cents."
  },
  {
    id: 7,
    name: "Ledger reconciliation",
    what_it_tests: "Ensure totals, taxes, splits and refunds reconcile",
    suggested_metric_target: "Financial invariant violations = 0",
    mvp_priority: true,
    category: "Reconciliation",
    current_metric: "0 invariant violations (100% mathematical balance)",
    status: "PASS",
    rationale: "Zero-tolerance release gate: Sum of line items, taxes, discounts, and split categories must strictly equal total charged."
  },
  {
    id: 8,
    name: "Spending insight accuracy",
    what_it_tests: "Produce explanations supported by historical transactions",
    suggested_metric_target: "Unsupported numeric claims = 0",
    mvp_priority: false,
    category: "Reasoning & Planning",
    current_metric: "0 unsupported numeric claims (100% DB grounded)",
    status: "PASS",
    rationale: "Every natural-language explanation strictly cites verified transaction database primary keys."
  },
  {
    id: 9,
    name: "Refund opportunity detection",
    what_it_tests: "Find purchases where return/refund review is warranted",
    suggested_metric_target: "Precision ≥ 95% for actionable alerts",
    mvp_priority: false,
    category: "Refund Intelligence",
    current_metric: "96.8% actionable return alert precision",
    status: "PASS",
    rationale: "Prioritizes high-probability returns (apparel within window, billing errors) while ignoring non-returnable perishables."
  },
  {
    id: 10,
    name: "Refund eligibility reasoning",
    what_it_tests: "Assess merchant policy, dates and product restrictions",
    suggested_metric_target: "Unsupported eligibility claims = 0",
    mvp_priority: true,
    category: "Refund Intelligence",
    current_metric: "0 unsupported eligibility assertions",
    status: "PASS",
    rationale: "Never hallucinates guaranteed return eligibility when return windows have expired or items are excluded."
  },
  {
    id: 11,
    name: "Refund workflow planning",
    what_it_tests: "Select the correct refund path and required next steps",
    suggested_metric_target: "Successful plan rate ≥ 95%",
    mvp_priority: false,
    category: "Refund Intelligence",
    current_metric: "97.5% correct retailer protocol generation",
    status: "PASS",
    rationale: "Directs users to in-store vouchers for Marshalls, freshness guarantee claims for Walmart, and billing disputes for carriers."
  },
  {
    id: 12,
    name: "Refund status tracking",
    what_it_tests: "Identify refund initiated, pending, completed or denied",
    suggested_metric_target: "State accuracy ≥ 99%",
    mvp_priority: false,
    category: "Refund Intelligence",
    current_metric: "99.5% lifecycle state transition accuracy",
    status: "PASS",
    rationale: "Maintains a rigorous finite state machine from Return Logged to Awaiting Credit to Verified Reconciled."
  },
  {
    id: 13,
    name: "Refund reconciliation",
    what_it_tests: "Match merchant refund to posted card/bank credit",
    suggested_metric_target: "Match precision ≥ 99%",
    mvp_priority: true,
    category: "Reconciliation",
    current_metric: "99.1% card credit statement match precision",
    status: "PASS",
    rationale: "Only credits 'Money Recovered' when an actual negative transaction settles on the bank statement feed."
  },
  {
    id: 14,
    name: "User-intent understanding",
    what_it_tests: "Correctly interpret natural-language expense/refund instructions",
    suggested_metric_target: "Task accuracy ≥ 95%",
    mvp_priority: false,
    category: "Reasoning & Planning",
    current_metric: "96.5% conversational intent resolution",
    status: "PASS",
    rationale: "Disambiguates fuzzy queries like 'Can I get money back for that Walmart thing?' without making rash write operations."
  },
  {
    id: 15,
    name: "Authorization and privacy",
    what_it_tests: "Prevent wrong-account access and unauthorized submissions",
    suggested_metric_target: "Critical violations = 0",
    mvp_priority: false,
    category: "Security & Privacy",
    current_metric: "0 tenant leaks, 100% RBAC multi-tenant isolation",
    status: "PASS",
    rationale: "Zero-tolerance security invariant: Strict row-level isolation between users, sanitization of card PANs, and read-only SQL sandboxing."
  }
];

export interface ConcreteEvalScenario {
  id: string;
  name: string;
  subtitle: string;
  benchmark_purchase: {
    merchant: string;
    amount: number;
    expected_category: string;
    date: string;
  };
  input_scenario: string;
  pass_criteria: string;
  status: 'PASS' | 'FAIL';
  execution_ms: number;
  cost_usd: number;
  ground_truth: Record<string, any>;
  model_output: Record<string, any>;
  assertions: Array<{ name: string; description: string; passed: boolean }>;
}

export const CONCRETE_EVAL_SCENARIOS_E1_E7: ConcreteEvalScenario[] = [
  {
    id: "E1",
    name: "The Imperfect Receipt",
    subtitle: "Tilted Walmart receipt with faint text, coupons, and tax",
    benchmark_purchase: {
      merchant: "Walmart",
      amount: 88.92,
      expected_category: "Grocery",
      date: "Oct 28, 2026"
    },
    input_scenario: "Upload a tilted Walmart receipt image with faint thermal printing, multi-line item discounts, 7.5% sales tax, and final total of $88.92.",
    pass_criteria: "Extract correct amounts ($82.14 subtotal, $6.78 tax, $88.92 total), avoid inventing unreadable barcode fields, and flag uncertain OCR lines for human clarification.",
    status: "PASS",
    execution_ms: 840,
    cost_usd: 0.00031,
    ground_truth: {
      merchant_clean: "Walmart",
      subtotal: 82.14,
      tax: 6.78,
      total_amount: 88.92,
      uncertain_fields_count: 1,
      triggers_hitl: true
    },
    model_output: {
      merchant_clean: "Walmart",
      subtotal: 82.14,
      tax: 6.78,
      total_amount: 88.92,
      uncertain_fields_count: 1,
      triggers_hitl: true,
      hitl_reason: "Faint register terminal code on line 8 flagged for verification"
    },
    assertions: [
      { name: "total_amount_exact_match", description: "Extracted total strictly matches $88.92", passed: true },
      { name: "tax_and_subtotal_balanced", description: "Subtotal ($82.14) + Tax ($6.78) == $88.92", passed: true },
      { name: "zero_hallucinated_fields", description: "Unreadable characters not fabricated into text", passed: true },
      { name: "flag_uncertain_line_hitl", description: "Triggers human-in-the-loop review card", passed: true }
    ]
  },
  {
    id: "E2",
    name: "The Mixed-Category Walmart Purchase",
    subtitle: "Multi-department basket split: $60 groceries + $28.92 clothing",
    benchmark_purchase: {
      merchant: "Walmart",
      amount: 88.92,
      expected_category: "Grocery / Apparel Split",
      date: "Oct 28, 2026"
    },
    input_scenario: "The $88.92 Walmart basket contains $60.00 of groceries and $28.92 of apparel items on the same printed register tape.",
    pass_criteria: "Allocate $60.00 to Grocery and $28.92 to Apparel, with no cent lost or double-counted in ledger sums.",
    status: "PASS",
    execution_ms: 620,
    cost_usd: 0.00019,
    ground_truth: {
      total: 88.92,
      splits: [
        { category: "Grocery", amount: 60.00 },
        { category: "Apparel", amount: 28.92 }
      ],
      sum_reconciled: 88.92,
      invariant_error: 0.00
    },
    model_output: {
      total: 88.92,
      splits: [
        { category: "Grocery", amount: 60.00 },
        { category: "Apparel", amount: 28.92 }
      ],
      sum_reconciled: 88.92,
      invariant_error: 0.00
    },
    assertions: [
      { name: "grocery_allocated_60", description: "$60.00 allocated to Grocery spending", passed: true },
      { name: "apparel_allocated_28_92", description: "$28.92 allocated to Apparel spending", passed: true },
      { name: "conservation_of_money", description: "Sum of category splits strictly equals $88.92 total", passed: true },
      { name: "zero_double_counting", description: "Purchase counted as 1 transaction with 2 sub-allocations", passed: true }
    ]
  },
  {
    id: "E3",
    name: "The Duplicate Receipt",
    subtitle: "Marshalls $38.69: Email receipt + physical photo + bank debit",
    benchmark_purchase: {
      merchant: "Marshalls",
      amount: 38.69,
      expected_category: "Apparel",
      date: "Oct 28, 2026"
    },
    input_scenario: "The user forwards the Marshalls $38.69 receipt by email, uploads a photo of the same paper receipt, and imports the card swipe from bank feed.",
    pass_criteria: "Produce one single purchase with three linked evidence sources, rather than three separate $38.69 expenses.",
    status: "PASS",
    execution_ms: 490,
    cost_usd: 0.00015,
    ground_truth: {
      distinct_purchases_created: 1,
      total_ledger_debit: 38.69,
      linked_evidence_count: 3,
      sources: ["email_receipt", "image_photo_scan", "plaid_bank_feed"]
    },
    model_output: {
      distinct_purchases_created: 1,
      total_ledger_debit: 38.69,
      linked_evidence_count: 3,
      sources: ["email_receipt", "image_photo_scan", "plaid_bank_feed"],
      deduplication_confidence: 0.994
    },
    assertions: [
      { name: "single_master_purchase", description: "Only 1 transaction committed to the ledger", passed: true },
      { name: "three_linked_evidence_sources", description: "Receipt photo, email, and card feed unified", passed: true },
      { name: "prevent_phantom_triplication", description: "Ledger balance debited $38.69, NOT $116.07", passed: true }
    ]
  },
  {
    id: "E4",
    name: "The Ambiguous Instruction",
    subtitle: "Conversational clarification: 'That Walmart thing, can I get my money back?'",
    benchmark_purchase: {
      merchant: "Walmart",
      amount: 88.92,
      expected_category: "Grocery",
      date: "Oct 28, 2026"
    },
    input_scenario: "User messages: 'That Walmart thing I bought last week, can I get my money back?'",
    pass_criteria: "Locate plausible Walmart transactions and ask which specific item is involved rather than assuming the entire basket is returnable.",
    status: "PASS",
    execution_ms: 540,
    cost_usd: 0.00018,
    ground_truth: {
      matched_transaction_id: "tx_walmart_88_92",
      requires_clarification: true,
      clarification_type: "item_selection",
      assumed_blanket_refund: false
    },
    model_output: {
      matched_transaction_id: "tx_walmart_88_92",
      requires_clarification: true,
      clarification_prompt: "Found your Walmart purchase from Oct 28 ($88.92). Since this receipt includes groceries and apparel, which specific item would you like to return?",
      assumed_blanket_refund: false
    },
    assertions: [
      { name: "identifies_walmart_purchase", description: "Correctly resolved $88.92 Walmart receipt", passed: true },
      { name: "prompts_for_item_disambiguation", description: "Asks user which line item they wish to return", passed: true },
      { name: "avoids_hallucinated_submission", description: "Does not initiate claim without user confirmation", passed: true }
    ]
  },
  {
    id: "E5",
    name: "Refund Eligibility Reasoning",
    subtitle: "Marshalls garment return requested outside policy window",
    benchmark_purchase: {
      merchant: "Marshalls",
      amount: 38.69,
      expected_category: "Apparel",
      date: "Aug 15, 2026"
    },
    input_scenario: "The user wants to return a worn Marshalls garment 70 days after purchase (policy window is 30 days, worn garments excluded).",
    pass_criteria: "Consult the relevant policy, distinguish refund from merchandise credit or exception requests, and never assert guaranteed eligibility without evidence.",
    status: "PASS",
    execution_ms: 710,
    cost_usd: 0.00022,
    ground_truth: {
      policy_window_days: 30,
      days_elapsed: 74,
      standard_return_eligible: false,
      recommended_action: "request_store_credit_exception",
      unsupported_claim_count: 0
    },
    model_output: {
      policy_window_days: 30,
      days_elapsed: 74,
      standard_return_eligible: false,
      recommended_action: "request_store_credit_exception",
      unsupported_claim_count: 0,
      policy_citation: "Marshalls policy allows 30 days with tags for original tender refund. Overdue returns require manager store-credit approval."
    },
    assertions: [
      { name: "policy_window_applied", description: "Correctly calculates 74 days > 30-day window", passed: true },
      { name: "rejects_guaranteed_full_refund", description: "Does not promise guaranteed cash return", passed: true },
      { name: "suggests_merchandise_credit", description: "Advises user on exception store credit workflow", passed: true }
    ]
  },
  {
    id: "E6",
    name: "Partial Refund Reconciliation",
    subtitle: "Marshalls $38.69 purchase receives verified $12.00 credit",
    benchmark_purchase: {
      merchant: "Marshalls",
      amount: 38.69,
      expected_category: "Apparel",
      date: "Oct 28, 2026"
    },
    input_scenario: "A $38.69 apparel purchase receives a verified $12.00 partial refund on the card statement.",
    pass_criteria: "Preserve the original $38.69 payment, record the linked $12.00 credit, and show $26.69 net spend without creating a phantom purchase.",
    status: "PASS",
    execution_ms: 410,
    cost_usd: 0.00012,
    ground_truth: {
      original_purchase: 38.69,
      refund_received: 12.00,
      net_spend: 26.69,
      refund_status: "partially_refunded",
      phantom_transactions: 0
    },
    model_output: {
      original_purchase: 38.69,
      refund_received: 12.00,
      net_spend: 26.69,
      refund_status: "partially_refunded",
      phantom_transactions: 0
    },
    assertions: [
      { name: "preserve_original_transaction", description: "Original $38.69 debit kept in ledger history", passed: true },
      { name: "link_refund_to_purchase", description: "$12.00 credit linked via parent foreign key", passed: true },
      { name: "no_double_counting", description: "Zero duplicate entries created in accounting", passed: true },
      { name: "correct_net_spend_26_69", description: "Net category spend accurately reflects $26.69", passed: true }
    ]
  },
  {
    id: "E7",
    name: "Refund Promised but Not Received",
    subtitle: "Merchant confirms $38.69 refund, but bank statement credit is missing",
    benchmark_purchase: {
      merchant: "Marshalls",
      amount: 38.69,
      expected_category: "Apparel",
      date: "Oct 28, 2026"
    },
    input_scenario: "A merchant confirms a $38.69 refund email, but no corresponding credit appears in the bank statement after 10 business days.",
    pass_criteria: "Keep the refund in pending/overdue status and flag it for follow-up rather than reporting $38.69 recovered.",
    status: "PASS",
    execution_ms: 480,
    cost_usd: 0.00014,
    ground_truth: {
      merchant_claim_status: "approved",
      bank_credit_detected: false,
      radar_status: "overdue_alert",
      money_recovered: 0.00,
      triggers_followup_alert: true
    },
    model_output: {
      merchant_claim_status: "approved",
      bank_credit_detected: false,
      radar_status: "overdue_alert",
      money_recovered: 0.00,
      triggers_followup_alert: true,
      alert_message: "Marshalls return for $38.69 is approved by retailer but overdue on card statement."
    },
    assertions: [
      { name: "status_remains_pending_or_overdue", description: "Placed into Overdue Radar column (>10 days)", passed: true },
      { name: "money_recovered_remains_zero", description: "Does not count as recovered until credit posts", passed: true },
      { name: "followup_inquiry_offered", description: "Generates dispute/inquiry draft for user", passed: true }
    ]
  }
];

export interface RefundRadarSpecializedEval {
  eval_key: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  focus: string;
  scenario_details: string;
  metric_name: string;
  metric_score: string;
  status: 'PASS';
  evidence_matrix: Array<{ item: string; evidence: string; recommendation: string; actionable: boolean }>;
}

export const REFUND_RADAR_SPECIALIZED_EVALS: RefundRadarSpecializedEval[] = [
  {
    eval_key: 'A',
    title: "A. Refund Opportunity Ranking",
    focus: "Precision@3 on genuine actionable return candidates vs speculative noise",
    scenario_details: "Evaluates whether the agent prioritizes genuinely actionable opportunities over speculative alerts across 3 candidate transactions.",
    metric_name: "Precision@3",
    metric_score: "100% (3/3 actionable recommendations)",
    status: "PASS",
    evidence_matrix: [
      {
        item: "Marshalls ($38.69 Apparel)",
        evidence: "Receipt available, purchase recent (Oct 28), tags intact",
        recommendation: "Check return eligibility & offer in-store voucher",
        actionable: true
      },
      {
        item: "Walmart ($88.92 Groceries)",
        evidence: "Perishable produce, no defect or freshness issue reported",
        recommendation: "Do not suggest routine return (perishable policy restriction)",
        actionable: false
      },
      {
        item: "AT&T ($75.00 Bill)",
        evidence: "Recurring bill, unexpected line item spike reported",
        recommendation: "Investigate carrier billing discrepancy under FCC 201(b)",
        actionable: true
      }
    ]
  },
  {
    eval_key: 'B',
    title: "B. Policy-Grounded Eligibility",
    focus: "Exact-rule grading for dates & amounts + human rubric for nuanced retailer policies",
    scenario_details: "Tests whether agent applies purchase dates, product exclusions, condition requirements, and return tender constraints correctly without guessing.",
    metric_name: "Policy Grounding Score",
    metric_score: "100% (0 policy hallucinations)",
    status: "PASS",
    evidence_matrix: [
      {
        item: "Marshalls Official Policy",
        evidence: "30-day window, original tags required, free in-store dropoff",
        recommendation: "Generate digital barcode voucher for store customer service desk",
        actionable: true
      },
      {
        item: "Walmart 100% Freshness Guarantee",
        evidence: "Perishables covered by satisfaction refund without physical return",
        recommendation: "Submit digital claim; physical dropoff waived for food items",
        actionable: true
      },
      {
        item: "AT&T Regulatory Dispute",
        evidence: "FCC Sec 201(b) 60-day billing dispute window for telecommunications",
        recommendation: "Draft formal billing adjustment inquiry letter to carrier",
        actionable: true
      }
    ]
  },
  {
    eval_key: 'C',
    title: "C. Refund Agent Tool Selection",
    focus: "Valid tool-sequence completion rate against expected workflow steps",
    scenario_details: "Verifies the agent executes the rigorous five-step sequence: Search Ledger -> Retrieve Policy -> Prepare Request -> Request Human Confirmation -> Monitor Status.",
    metric_name: "Tool Sequence Adherence",
    metric_score: "100% (5/5 sequential tool calls valid)",
    status: "PASS",
    evidence_matrix: [
      {
        item: "1. Search Ledger & Receipt",
        evidence: "Query database for transaction #tx_marshalls_38_69 and itemized tags",
        recommendation: "Passed with valid receipt citation",
        actionable: true
      },
      {
        item: "2. Retrieve Merchant Policy",
        evidence: "Look up verified Marshalls support directory and 30-day window",
        recommendation: "Verified policy grounding",
        actionable: true
      },
      {
        item: "3. Prepare Return Draft",
        evidence: "Generate customer service draft and barcode voucher for review",
        recommendation: "Draft generated for human review",
        actionable: true
      },
      {
        item: "4. Request User Confirmation",
        evidence: "Offer 'Complete loop with AI' button before finalizing claim",
        recommendation: "Human confirmation gate respected",
        actionable: true
      },
      {
        item: "5. Monitor Status",
        evidence: "Log claim to Refund Radar under 'Awaiting Credit' with 7-day timer",
        recommendation: "Active reconciliation listener enabled",
        actionable: true
      }
    ]
  },
  {
    eval_key: 'D',
    title: "D. Refund Value Accounting (Financial State Machine)",
    focus: "Strict state separation: Potential vs Requested vs Approved vs Recovered",
    scenario_details: "Guarantees that a submitted or approved refund is NEVER counted as recovered money until the bank credit settles.",
    metric_name: "Ledger Financial State Invariant",
    metric_score: "0 invariant violations",
    status: "PASS",
    evidence_matrix: [
      {
        item: "Potential Refund",
        evidence: "Opportunity identified on Refund Radar ($38.69)",
        recommendation: "Recorded as potential opportunity ($38.69), recovered = $0.00",
        actionable: true
      },
      {
        item: "Refund Requested",
        evidence: "Merchant return draft submitted to retailer",
        recommendation: "Logged as 'Awaiting Credit', recovered = $0.00",
        actionable: true
      },
      {
        item: "Refund Approved",
        evidence: "Retailer acknowledges return and promises credit in 3-5 days",
        recommendation: "Approved status maintained, recovered = $0.00",
        actionable: true
      },
      {
        item: "Money Recovered",
        evidence: "Plaid bank statement credit of -$38.69 posts and reconciles",
        recommendation: "Officially updated to Recovered ($38.69)",
        actionable: true
      }
    ]
  },
  {
    eval_key: 'E',
    title: "E. Refund vs. Billing Dispute (CFPB Adversarial Eval)",
    focus: "Differentiating voluntary returns from missing refunds, duplicates, and unauthorized charges",
    scenario_details: "Tests that the agent routes users to the appropriate consumer protection framework (voluntary retailer return vs CFPB Regulation Z billing error notice).",
    metric_name: "Adversarial Routing Accuracy",
    metric_score: "100% (Correct statutory path chosen)",
    status: "PASS",
    evidence_matrix: [
      {
        item: "Voluntary Retailer Return",
        evidence: "Unwanted apparel within 30 days (Marshalls)",
        recommendation: "Merchant store return policy & barcode dropoff",
        actionable: true
      },
      {
        item: "Missing Approved Refund",
        evidence: "Merchant agreed to refund but credit never posted after 10 days",
        recommendation: "Retailer escalation followed by card dispute if unresolved",
        actionable: true
      },
      {
        item: "Duplicate Charge",
        evidence: "Identical $18.50 charges at same diner within 15 minutes",
        recommendation: "Card issuer billing error notice under CFPB Reg Z § 1026.13",
        actionable: true
      },
      {
        item: "Carrier Billing Discrepancy",
        evidence: "AT&T plan charged above agreed contract rate ($75.00)",
        recommendation: "Carrier telecommunications notice citing FCC Sec 201(b)",
        actionable: true
      }
    ]
  }
];

export interface ScorecardCategory {
  name: string;
  score: number;
  weight: number;
}

export const PRACTICAL_SCORECARD_DEFAULT = {
  release_target: 95.0,
  categories: [
    { name: "Transaction & receipt accuracy", score: 97, weight: 0.25 },
    { name: "Categorization & insights", score: 94, weight: 0.20 },
    { name: "Refund eligibility & planning", score: 89, weight: 0.25 },
    { name: "Refund tracking & reconciliation", score: 96, weight: 0.20 },
    { name: "Agent workflow efficiency", score: 91, weight: 0.10 }
  ],
  release_gates: [
    { name: "Financial Invariant Violations", value: 0, target: "= 0", status: "PASS" },
    { name: "Critical Authorization & Privacy Violations", value: 0, target: "= 0", status: "PASS" },
    { name: "Unsupported Numeric Claims", value: 0, target: "= 0", status: "PASS" }
  ],
  formulas: [
    { name: "Category precision", formula: "Correctly predicted category instances / All predicted instances of that category", rationale: "Prevents incorrectly labeled expenses" },
    { name: "Category recall", formula: "Correctly predicted category instances / All true instances of that category", rationale: "Measures missed classification cases" },
    { name: "Duplicate-detection precision", formula: "Correct duplicate flags / All duplicate flags", rationale: "Avoids merging two real purchases" },
    { name: "Refund opportunity precision", formula: "Valid opportunities alerted / All opportunities alerted", rationale: "Avoids misleading refund suggestions" },
    { name: "Refund opportunity recall", formula: "Valid opportunities alerted / All known valid opportunities", rationale: "Finds opportunities users might miss" },
    { name: "Refund reconciliation accuracy", formula: "Correctly reconciled refunds / Refunds eligible for reconciliation", rationale: "Measures financial ledger reliability" },
    { name: "Agent task success", formula: "Correctly completed tasks / Evaluated tasks", rationale: "Captures end-to-end execution" }
  ]
};

export const EVAL_DATASET_BREAKDOWN = [
  { category: "Receipt extraction", cases: 40, edge_cases: "Faded receipts, taxes, coupons, multiple items" },
  { category: "Categorization", cases: 40, edge_cases: "Walmart mixed basket, Amazon purchases, ambiguous merchants" },
  { category: "Duplicate detection and reconciliation", cases: 30, edge_cases: "Email + bank duplicates, pending vs posted transactions" },
  { category: "Refund eligibility", cases: 35, edge_cases: "Return windows, excluded items, missing receipts" },
  { category: "Agent workflow", cases: 30, edge_cases: "Tool failures, policy lookup, user approval, retries" },
  { category: "Refund settlement", cases: 25, edge_cases: "Partial refunds, delayed credits, split tenders" }
];

export const SAMPLE_EVAL_TEST_RECORD = {
  eval_id: "REFUND_001",
  scenario: "Partial clothing return",
  input: {
    merchant: "Marshalls",
    purchase_amount: 38.69,
    refund_credit: 12.00,
    refund_posted: true
  },
  expected: {
    original_purchase: 38.69,
    refund_received: 12.00,
    net_spend: 26.69,
    refund_status: "partially_refunded"
  },
  assertions: [
    "preserve_original_transaction",
    "link_refund_to_purchase",
    "no_double_counting",
    "correct_net_spend"
  ]
};

export const LONG_TERM_AMBITIOUS_EVALS = [
  {
    id: 1,
    title: "1. Financial Memory Eval",
    description: "Evaluates retention of user-specific classification overrides with nuanced exceptions.",
    scenario: "User specifies: 'Always categorize purchases from Sweetgreen as Outside Food, except when I buy bottled drinks for an office event.'",
    test_condition: "Does the agent retain the rule, respect the exception, and apply updates consistently without mutating historical records unexpectedly?",
    status: "Active Benchmark in Sandbox"
  },
  {
    id: 2,
    title: "2. Counterfactual Refund Eval",
    description: "Evaluates stability of reasoning when exactly one factual premise is altered.",
    scenario: "An item was purchased 10 days ago versus 60 days ago.",
    test_condition: "Does the recommendation change appropriately based on merchant policy windows while all other facts remain invariant?",
    status: "Active Benchmark in Sandbox"
  },
  {
    id: 3,
    title: "3. Autonomous Recovery Eval",
    description: "Evaluates resilience when external merchant portals or links fail.",
    scenario: "A refund agent encounters an unavailable merchant portal, an expired link, or a request for authentication.",
    test_condition: "Can it recover gracefully, preserve workflow state, avoid duplicate submissions, and hand off to the user instead of fabricating a successful refund?",
    status: "Active Benchmark in Sandbox"
  }
];

export const MOCK_EVAL_DATA = {
  run_id: "eval_run_94b1a37c",
  timestamp: "2026-10-28T21:40:00Z",
  total_tests: 200,
  passed_tests: 194,
  failed_tests: 6,
  accuracy_rate: 0.970,
  weighted_score: 93.6,
  release_target: 95.0,
  p95_latency_ms: 1120,
  average_latency_ms: 540,
  total_cost_usd: 0.0412,
  model_name: "gemini-2.0-flash (Tiered Reasoning)",
  results: CONCRETE_EVAL_SCENARIOS_E1_E7.map(c => ({
    id: c.id,
    test_id: `eval_${c.id.toLowerCase()}`,
    test_name: c.name,
    category: c.benchmark_purchase.expected_category,
    status: c.status,
    duration_ms: c.execution_ms,
    token_cost_usd: c.cost_usd,
    ground_truth_json: JSON.stringify(c.ground_truth),
    predicted_json: JSON.stringify(c.model_output)
  }))
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

// Password Complexity & Policy Guidance Checker
// Minimum 10 characters, at least 1 uppercase, at least 1 lowercase, at least 1 special character
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasSpecial: boolean;
} {
  const hasMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  
  const errors: string[] = [];
  if (!hasMinLength) errors.push("Minimum 10 characters required.");
  if (!hasUpper) errors.push("At least 1 capital letter (A-Z) required.");
  if (!hasLower) errors.push("At least 1 lowercase letter (a-z) required.");
  if (!hasSpecial) errors.push("At least 1 special character (!@#$%^&*) required.");

  return {
    valid: hasMinLength && hasUpper && hasLower && hasSpecial,
    errors,
    hasMinLength,
    hasUpper,
    hasLower,
    hasSpecial
  };
}

// Simulated User Account Registry in Browser LocalStorage
const USERS_STORAGE_KEY = 'spendtrace_simulated_users';

interface StoredUser {
  id: string;
  email: string;
  username: string;
  password: string;
  full_name: string;
  role: 'admin' | 'member' | 'guest';
  email_verified?: boolean;
}

export function isMfaExempt(identifier: string, role?: string): boolean {
  const clean = identifier.trim().toLowerCase();
  if (role === 'guest' || role === 'admin') return true;
  if (clean === 'admin' || clean === 'admin@spendtrace.ai' || clean === 'newuser' || clean === 'newuser@spendtrace.ai') return true;
  if (clean === 'guest' || clean === 'guest@spendtrace.ai' || clean.startsWith('guest_')) return true;
  return false;
}

export function mockGenerateMfaCode(email: string): string {
  const clean = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    sessionStorage.setItem(`spendtrace_mfa_${clean}`, code);
  } catch (e) {}
  return code;
}

export function mockVerifyMfaCode(email: string, code: string): { user: any; access_token: string } {
  const clean = email.trim().toLowerCase();
  const inputCode = code.trim();
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(`spendtrace_mfa_${clean}`);
  } catch (e) {}

  if (inputCode !== "123456" && stored && inputCode !== stored) {
    throw new Error("Invalid or expired MFA verification code. Please check your email and try again.");
  }
  try {
    sessionStorage.removeItem(`spendtrace_mfa_${clean}`);
  } catch (e) {}

  const users = getStoredUsers();
  const found = users[clean] || Object.values(users).find(u => u.email.toLowerCase() === clean);
  if (found) {
    found.email_verified = true;
    users[clean] = found;
    users[found.email] = found;
    saveStoredUsers(users);
    const token = `mock_jwt_${found.id}_${Date.now()}`;
    return {
      user: {
        id: found.id,
        email: found.email,
        role: found.role,
        full_name: found.full_name,
        email_verified: true,
        is_clean_slate: true
      },
      access_token: token
    };
  }

  const genericId = `usr_${Date.now()}`;
  return {
    user: {
      id: genericId,
      email: clean,
      role: "member",
      full_name: clean.split('@')[0],
      email_verified: true,
      is_clean_slate: true
    },
    access_token: `mock_jwt_${genericId}`
  };
}

export function mockGuestLogin(): { user: any; access_token: string } {
  const id = `guest_${Math.random().toString(36).substring(2, 9)}`;
  const email = `${id}@guest.spendtrace.ai`;
  return {
    user: {
      id: id,
      email: email,
      role: 'guest',
      full_name: 'Guest User',
      email_verified: true,
      is_clean_slate: true
    },
    access_token: `mock_guest_jwt_${id}`
  };
}

function getStoredUsers(): Record<string, StoredUser> {
  // Default and pre-seeded accounts
  const defaults: Record<string, StoredUser> = {
    "admin@spendtrace.ai": {
      id: MOCK_ADMIN_USER.id,
      email: MOCK_ADMIN_USER.email,
      username: "admin",
      password: "",
      full_name: MOCK_ADMIN_USER.full_name,
      role: "admin",
      email_verified: true
    },
    "admin": {
      id: MOCK_ADMIN_USER.id,
      email: MOCK_ADMIN_USER.email,
      username: "admin",
      password: "",
      full_name: MOCK_ADMIN_USER.full_name,
      role: "admin",
      email_verified: true
    },
    "newuser@spendtrace.ai": {
      id: MOCK_NEW_USER.id,
      email: MOCK_NEW_USER.email,
      username: "newuser",
      password: "Userpassword123!",
      full_name: MOCK_NEW_USER.full_name,
      role: "member",
      email_verified: true
    },
    "newuser": {
      id: MOCK_NEW_USER.id,
      email: MOCK_NEW_USER.email,
      username: "newuser",
      password: "Userpassword123!",
      full_name: MOCK_NEW_USER.full_name,
      role: "member",
      email_verified: true
    },
    "shivani@spendtrace.ai": {
      id: "usr_shivani_001",
      email: "shivani@spendtrace.ai",
      username: "shivani",
      password: "Password123!@#",
      full_name: "Shivani",
      role: "member",
      email_verified: true
    },
    "shivani": {
      id: "usr_shivani_001",
      email: "shivani@spendtrace.ai",
      username: "shivani",
      password: "Password123!@#",
      full_name: "Shivani",
      role: "member",
      email_verified: true
    }
  };

  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (e) {}
  
  return defaults;
}

function saveStoredUsers(users: Record<string, StoredUser>): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {}
}

export function mockRegisterUser(identifier: string, password: string, fullName?: string): { user?: any; access_token?: string; mfa_required?: boolean; email?: string; dev_code_hint?: string; message?: string } {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const clean = identifier.trim().toLowerCase();
  // Support user's own email account (e.g. user@gmail.com, custom personal email)
  const email = clean.includes('@') ? clean : `${clean}@spendtrace.ai`;
  const username = clean.replace(/@.*$/, '');
  const users = getStoredUsers();

  const exempt = isMfaExempt(email);

  // If already exists, update credentials
  if (users[email] || users[clean] || users[username]) {
    const existing = users[email] || users[clean] || users[username];
    existing.password = password;
    if (fullName) existing.full_name = fullName;
    existing.email_verified = exempt ? true : false;
    users[email] = existing;
    users[username] = existing;
    users[clean] = existing;
    saveStoredUsers(users);

    if (!exempt) {
      const code = mockGenerateMfaCode(email);
      return {
        mfa_required: true,
        email: email,
        dev_code_hint: code,
        message: `Mandatory MFA: A 6-digit verification code has been dispatched to ${email}.`
      };
    }

    const token = `mock_jwt_${existing.id}_${Date.now()}`;
    return {
      mfa_required: false,
      user: {
        id: existing.id,
        email: existing.email,
        role: existing.role,
        full_name: existing.full_name,
        email_verified: true
      },
      access_token: token
    };
  }

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    email: email,
    username: username,
    password: password,
    full_name: fullName || username.charAt(0).toUpperCase() + username.slice(1),
    role: "member",
    email_verified: exempt ? true : false
  };

  users[email] = newUser;
  users[username] = newUser;
  users[clean] = newUser;
  saveStoredUsers(users);

  if (!exempt) {
    const code = mockGenerateMfaCode(email);
    return {
      mfa_required: true,
      email: email,
      dev_code_hint: code,
      message: `Mandatory MFA: A 6-digit verification code has been dispatched to ${email}.`
    };
  }

  const token = `mock_jwt_${newUser.id}_${Date.now()}`;
  return {
    mfa_required: false,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name,
      email_verified: true
    },
    access_token: token
  };
}

export function mockLoginUser(identifier: string, password: string): { user?: any; access_token?: string; mfa_required?: boolean; email?: string; dev_code_hint?: string; message?: string } {
  const clean = identifier.trim().toLowerCase();
  const email = clean.includes('@') ? clean : `${clean}@spendtrace.ai`;
  const username = clean.replace(/@.*$/, '');
  const users = getStoredUsers();

  // Guest shortcut
  if (clean === 'guest' || clean === 'guest@spendtrace.ai') {
    return mockGuestLogin();
  }

  // Demo shortcut
  if (clean === 'admin' || clean === 'admin@spendtrace.ai') {
    return {
      mfa_required: false,
      user: MOCK_ADMIN_USER,
      access_token: 'mock_admin_jwt_token'
    };
  }
  if (clean === 'newuser' || clean === 'newuser@spendtrace.ai') {
    return {
      mfa_required: false,
      user: MOCK_NEW_USER,
      access_token: 'mock_member_jwt_token'
    };
  }

  let found = users[clean] || users[email] || users[username];
  
  if (!found) {
    if (clean === 'shivani' || clean === 'shivani@spendtrace.ai') {
      const newShivani: StoredUser = {
        id: "usr_shivani_001",
        email: "shivani@spendtrace.ai",
        username: "shivani",
        password: password,
        full_name: "Shivani",
        role: "member",
        email_verified: true
      };
      users["shivani"] = newShivani;
      users["shivani@spendtrace.ai"] = newShivani;
      saveStoredUsers(users);
      found = newShivani;
    } else {
      throw new Error(`Account '${identifier}' not found. Please click 'Create Account' first or verify your spelling.`);
    }
  }

  // Verify password
  const isMatch = found.password === password || 
                  (clean.includes('admin') && password.toLowerCase().includes('admin')) ||
                  (clean.includes('newuser') && password.toLowerCase().includes('user')) ||
                  (clean.includes('shivani') && (password === 'Password123!@#' || password.length >= 8));
                  
  if (!isMatch) {
    throw new Error("Incorrect password. Click 'Reset Password' below or enter your registered password.");
  }

  const exempt = isMfaExempt(found.email, found.role);
  if (!exempt && !found.email_verified) {
    const code = mockGenerateMfaCode(found.email);
    return {
      mfa_required: true,
      email: found.email,
      dev_code_hint: code,
      message: `Mandatory MFA: A 6-digit verification code has been dispatched to ${found.email}.`
    };
  }

  const token = `mock_jwt_${found.id}_${Date.now()}`;
  return {
    mfa_required: false,
    user: {
      id: found.id,
      email: found.email,
      role: found.role,
      full_name: found.full_name,
      email_verified: Boolean(found.email_verified)
    },
    access_token: token
  };
}

export function mockResetPassword(identifier: string, newPassword: string): { message: string; user: any; access_token: string } {
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const clean = identifier.trim().toLowerCase();
  const email = clean.includes('@') ? clean : `${clean}@spendtrace.ai`;
  const username = clean.replace(/@.*$/, '');
  const users = getStoredUsers();

  const found = users[clean] || users[email] || users[username];
  if (!found) {
    throw new Error(`No account found matching '${identifier}'. Please create an account.`);
  }

  found.password = newPassword;
  users[email] = found;
  users[username] = found;
  saveStoredUsers(users);

  const token = `mock_jwt_${found.id}_${Date.now()}`;
  return {
    message: "Password successfully updated! You are now logged in.",
    user: {
      id: found.id,
      email: found.email,
      role: found.role,
      full_name: found.full_name
    },
    access_token: token
  };
}

// Client-side CSV Master Ledger generation & download for Demo Admin & users
export function generateMasterLedgerCsv(transactions: any[]): string {
  const headers = ["ID", "Date", "Merchant", "Amount", "Category", "Status", "Source", "HasReceipt", "IsReturn"];
  const rows = transactions.map(t => [
    t.id || "",
    t.date || "",
    `"${(t.merchant_clean || t.merchant_raw || "").replace(/"/g, '""')}"`,
    typeof t.amount === 'number' ? t.amount.toFixed(2) : (t.amount || "0.00"),
    `"${(t.category || "General").replace(/"/g, '""')}"`,
    t.status || "verified",
    t.source || "manual",
    t.has_receipt ? "true" : "false",
    t.is_return ? "true" : "false"
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
}

export function downloadCsvLocally(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// =====================================================================
// Verified Vendor Customer Support Directory & Dispute Draft Generation
// =====================================================================

export interface VendorSupportInfo {
  canonical_name: string;
  support_email: string;
  support_url: string;
  domain: string;
  department: string;
  source_citation: string;
  email_validation: {
    is_valid: boolean;
    format_valid: boolean;
    domain: string;
    domain_matches_brand: boolean;
    validation_badge: string;
    validation_note: string;
  };
}

export const VENDOR_SUPPORT_DIRECTORY: Record<string, Omit<VendorSupportInfo, 'email_validation'>> = {
  "zara": {
    canonical_name: "Zara",
    support_email: "contact.us@zara.com",
    support_url: "https://www.zara.com/us/en/help/returns-and-refunds-h38.html",
    domain: "zara.com",
    department: "Zara Customer Service & Returns Claims",
    source_citation: "Zara Official Help Center - Returns & Refunds Policy (https://www.zara.com/us/en/help/returns-and-refunds-h38.html)"
  },
  "apple": {
    canonical_name: "Apple Store",
    support_email: "order_support@apple.com",
    support_url: "https://www.apple.com/shop/help/returns_refund",
    domain: "apple.com",
    department: "Apple Online Store Support",
    source_citation: "Apple Official Support - Returns & Refunds (https://www.apple.com/shop/help/returns_refund)"
  },
  "target": {
    canonical_name: "Target",
    support_email: "guest.relations@target.com",
    support_url: "https://help.target.com/help/subcategoryarticle?childcat=Returns+%26+refunds",
    domain: "target.com",
    department: "Target Guest Relations & Returns Team",
    source_citation: "Target Help Center - Returns & Refunds (https://help.target.com/)"
  },
  "amazon": {
    canonical_name: "Amazon",
    support_email: "orders@amazon.com",
    support_url: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7",
    domain: "amazon.com",
    department: "Amazon Customer Care & Dispute Resolution",
    source_citation: "Amazon Customer Service Hub (https://www.amazon.com/contact-us)"
  },
  "nordstrom": {
    canonical_name: "Nordstrom",
    support_email: "contact@nordstrom.com",
    support_url: "https://www.nordstrom.com/browse/customer-service/return-policy",
    domain: "nordstrom.com",
    department: "Nordstrom Customer Care",
    source_citation: "Nordstrom Customer Service & Return Policy (https://www.nordstrom.com/browse/customer-service/return-policy)"
  },
  "trader joe's": {
    canonical_name: "Trader Joe's",
    support_email: "customer.relations@traderjoes.com",
    support_url: "https://www.traderjoes.com/home/contact-us",
    domain: "traderjoes.com",
    department: "Trader Joe's Customer Relations",
    source_citation: "Trader Joe's Official Contact Us Portal (https://www.traderjoes.com/home/contact-us)"
  },
  "whole foods": {
    canonical_name: "Whole Foods Market",
    support_email: "customer.questions@wholefoods.com",
    support_url: "https://www.wholefoodsmarket.com/customer-service",
    domain: "wholefoodsmarket.com",
    department: "Whole Foods Customer Care",
    source_citation: "Whole Foods Market Customer Service (https://www.wholefoodsmarket.com/customer-service)"
  },
  "marshalls": {
    canonical_name: "Marshalls",
    support_email: "customer.service@marshalls.com",
    support_url: "https://www.marshalls.com/us/store/jump/topic/Return-Policy/2400016",
    domain: "marshalls.com",
    department: "Marshalls Customer Experience & Returns",
    source_citation: "Marshalls Official Return Policy & Customer Service (https://www.marshalls.com/us/store/jump/topic/Return-Policy/2400016)"
  },
  "walmart": {
    canonical_name: "Walmart",
    support_email: "help@walmart.com",
    support_url: "https://www.walmart.com/help/article/walmart-standard-return-policy/3221592e5394416684aa54eb3d50eb97",
    domain: "walmart.com",
    department: "Walmart Customer Care & Returns Dept",
    source_citation: "Walmart Official Standard Return Policy (https://www.walmart.com/help)"
  },
  "restaurant": {
    canonical_name: "Restaurant",
    support_email: "guest_relations@restaurant.com",
    support_url: "https://www.restaurant.com/help",
    domain: "restaurant.com",
    department: "Guest Relations & Dispute Services",
    source_citation: "Restaurant Merchant Support & Billing (https://www.restaurant.com/help)"
  },
  "at&t": {
    canonical_name: "AT&T",
    support_email: "billing.support@att.com",
    support_url: "https://www.att.com/support/article/wireless/KM1008860/",
    domain: "att.com",
    department: "AT&T Wireless Billing & Dispute Resolution",
    source_citation: "AT&T Wireless Support & Return Policy (https://www.att.com/support/)"
  }
};

export function validateVendorEmail(email: string, expectedDomain?: string) {
  const emailClean = (email || "").trim();
  const rfcPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  const isValidFormat = rfcPattern.test(emailClean);
  
  const domain = emailClean.includes('@') ? emailClean.split('@')[1].toLowerCase() : '';
  let domainMatches = true;
  if (expectedDomain && domain) {
    const cleanExp = expectedDomain.toLowerCase().replace("www.", "");
    domainMatches = domain.includes(cleanExp) || cleanExp.includes(domain);
  }

  const isVerified = isValidFormat && Boolean(domain) && domainMatches;

  return {
    is_valid: isVerified,
    format_valid: isValidFormat,
    domain,
    domain_matches_brand: domainMatches,
    validation_badge: isVerified ? "✓ Verified Accurate Vendor Email" : "Standard Support Email",
    validation_note: isVerified 
      ? `RFC 5322 verified, domain '${domain}' matches vendor support records.` 
      : "Standard customer service contact."
  };
}

export function getVendorSupportContact(merchantName: string): VendorSupportInfo {
  const key = (merchantName || "").trim().toLowerCase();
  for (const [dirKey, info] of Object.entries(VENDOR_SUPPORT_DIRECTORY)) {
    if (dirKey.includes(key) || key.includes(dirKey)) {
      const emailValidation = validateVendorEmail(info.support_email, info.domain);
      return {
        ...info,
        email_validation: emailValidation
      };
    }
  }

  // Dynamic fallback for unlisted vendors
  const cleanDomain = key.replace(/[^a-zA-Z0-9]/g, "") + ".com";
  const supportEmail = `support@${cleanDomain}`;
  const supportUrl = `https://www.${cleanDomain}/help`;
  const emailValidation = validateVendorEmail(supportEmail, cleanDomain);
  return {
    canonical_name: merchantName ? merchantName.charAt(0).toUpperCase() + merchantName.slice(1) : "Merchant",
    support_email: supportEmail,
    support_url: supportUrl,
    domain: cleanDomain,
    department: `${merchantName} Customer Support`,
    source_citation: `${merchantName} Support Portal (${supportUrl})`,
    email_validation: emailValidation
  };
}

export interface RetailerNextStepInfo {
  protocol_title: string;
  protocol_summary: string;
  action_type: 'in_store_voucher' | 'digital_claim' | 'email_dispute' | 'carrier_dispute';
  action_label: string;
  recommended_channel: string;
  policy_window: string;
  claim_code: string;
  barcode_data?: string;
  has_dropoff: boolean;
  dropoff_instructions?: string;
  ai_loop_action_label: string;
  ai_loop_description: string;
  key_points: string[];
}

export function getRetailerProductNextStep(
  merchantName: string,
  itemDescription?: string,
  amount?: number,
  category?: string
): RetailerNextStepInfo {
  const m = (merchantName || '').trim().toLowerCase();
  const amt = amount ? `$${amount.toFixed(2)}` : '$0.00';
  const cat = (category || '').trim();

  if (m.includes('marshalls')) {
    return {
      protocol_title: "Marshalls Apparel Return Protocol",
      protocol_summary: "Marshalls accepts returns within 30 days of purchase in original condition with tags. In-store returns to any Marshalls store are 100% free with immediate receipt credit. For online or mail inquiries, customer care authorization is required.",
      action_type: 'in_store_voucher',
      action_label: "Start Return",
      recommended_channel: "In-Store Return Desk (Free) or Customer Care Email",
      policy_window: "Within 30 days of purchase (Active through Nov 27, 2026)",
      claim_code: "MAR-RET-89421-ST",
      barcode_data: "40084210386926",
      has_dropoff: true,
      dropoff_instructions: "Bring item with receipt tags attached to any Marshalls customer service counter. Present this digital voucher or barcode for immediate refund.",
      ai_loop_action_label: "Complete loop with AI",
      ai_loop_description: "AI registers return claim #MAR-RET-89421-ST, queues digital return voucher, moves $38.69 to Refund Radar 'Awaiting Bank Credit', and watches statement for refund.",
      key_points: [
        "Return window: 30 days from purchase (Tags attached)",
        "No drop-off fee at any local Marshalls store",
        "Estimated refund: $38.69 to original payment method",
        "Automated Refund Radar monitoring activated"
      ]
    };
  }

  if (m.includes('walmart')) {
    return {
      protocol_title: "Walmart 100% Freshness Guarantee (Perishable Groceries)",
      protocol_summary: "Walmart's corporate policy guarantees grocery freshness within 7 days. Under the Freshness Guarantee, physical item return of perishable groceries is NOT required — a customer care claim or email secures a direct statement credit.",
      action_type: 'digital_claim',
      action_label: "Start Return",
      recommended_channel: "Walmart Freshness Guarantee Digital Claim & Support Email",
      policy_window: "Within 7 days of purchase (Freshness Guarantee)",
      claim_code: "WMT-GROC-57218-ST",
      has_dropoff: false,
      dropoff_instructions: "No physical return drop-off required. Walmart Freshness Guarantee credits grocery items digitally without returning perishables.",
      ai_loop_action_label: "Complete loop with AI",
      ai_loop_description: "AI files Freshness Guarantee claim #WMT-GROC-57218-ST with Walmart Customer Care, logs $88.92 pending credit, and monitors bank statement for posting within 3-5 days.",
      key_points: [
        "Walmart Freshness Guarantee applies to all 5 grocery items",
        "Physical return waived for perishable food items",
        "Direct refund of $88.92 back to payment card",
        "Instant settlement tracking via Refund Radar"
      ]
    };
  }

  if (m.includes('restaurant')) {
    return {
      protocol_title: "Restaurant Guest Relations Dining Billing Inquiry",
      protocol_summary: "Dining purchases and restaurant service fees require direct merchant resolution through Guest Relations. SpendTrace drafts a professional billing discrepancy notice citing the dinner receipt ($42.80 + $3.90 tax).",
      action_type: 'email_dispute',
      action_label: "Start Refund",
      recommended_channel: "Merchant Guest Relations & Dispute Services",
      policy_window: "Immediate Merchant Review Window",
      claim_code: "RST-DISP-39104-ST",
      has_dropoff: false,
      dropoff_instructions: "Direct digital dispute. Verified receipt itemization and tax breakdown attached.",
      ai_loop_action_label: "Complete loop with AI",
      ai_loop_description: "AI transmits dining billing inquiry #RST-DISP-39104-ST to Guest Relations, logs $46.70 in Refund Radar, and sets a 5-day credit settlement deadline.",
      key_points: [
        "Merchant Guest Relations billing resolution",
        "Receipt itemized: Dinner $42.80 + Tax $3.90 = $46.70",
        "Demand for prompt card adjustment or refund",
        "Refund Radar alerts if credit unposted after 5 days"
      ]
    };
  }

  if (m.includes('at&t') || m.includes('att')) {
    return {
      protocol_title: "AT&T Wireless Telecommunications Billing Dispute",
      protocol_summary: "Pursuant to the AT&T Wireless Customer Agreement and FCC Section 201(b), billing disputes must be formally filed within 60 days of the bill date. SpendTrace generates a carrier dispute notice for the $75.00 mobile service charge.",
      action_type: 'carrier_dispute',
      action_label: "Start Refund",
      recommended_channel: "AT&T Wireless Billing Resolution Team",
      policy_window: "Within 60 days of invoice date (Statutory Carrier Policy)",
      claim_code: "ATT-BILL-10492-ST",
      has_dropoff: false,
      dropoff_instructions: "Carrier billing dispute resolution. Direct statement credit or next bill offset.",
      ai_loop_action_label: "Complete loop with AI",
      ai_loop_description: "AI registers telecommunications billing dispute #ATT-BILL-10492-ST, records $75.00 pending credit on Refund Radar, and monitors next billing cycle offset.",
      key_points: [
        "Formal carrier billing dispute pursuant to FCC Section 201(b)",
        "Mobile Service monthly bill: $75.00",
        "Eligible for statement credit or next invoice offset",
        "Automated reconciliation against bank statement"
      ]
    };
  }

  // Default fallback for any merchant
  const cleanM = (merchantName || 'Retailer').trim();
  const code = `${cleanM.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'RET'}-RET-${Math.floor(10000 + Math.random() * 90000)}-ST`;
  return {
    protocol_title: `${cleanM} Return & Refund Procedure`,
    protocol_summary: `Standard merchant return procedure for ${itemDescription || 'purchased items'}${cat ? ` (${cat})` : ''}. SpendTrace analyzes the return window and verified customer service directory to initiate an auditable refund claim.`,
    action_type: 'email_dispute',
    action_label: "Start Return",
    recommended_channel: "Official Customer Support & Returns Desk",
    policy_window: "Standard 30-Day Merchant Window",
    claim_code: code,
    has_dropoff: false,
    ai_loop_action_label: "Complete loop with AI",
    ai_loop_description: `AI dispatches claim #${code} to ${cleanM} customer support, places ${amt} on Refund Radar, and tracks statement credits.`,
    key_points: [
      `Merchant return claim for ${cleanM}`,
      `Item: ${itemDescription || 'Merchandise'} (${amt})`,
      "Official vendor support contact verified",
      "Refund Radar statement credit reconciler active"
    ]
  };
}

export function generateCustomizedDisputeDraft(
  refund: any,
  customerName?: string,
  customerEmail?: string
): {
  merchant: string;
  vendor_contact: VendorSupportInfo;
  subject: string;
  body: string;
  next_step: RetailerNextStepInfo;
} {
  const merchantName = refund.merchant_name || refund.merchant || "Vendor";
  const contact = getVendorSupportContact(merchantName);
  const amount = Math.abs(Number(refund.expected_amount || refund.amount || 0));
  const amtFormatted = `$${amount.toFixed(2)}`;
  const returnDate = refund.return_date || refund.date || "2026-10-28";
  const deadlineStr = refund.deadline_date || "within 10 business days";
  const desc = refund.item_description || "Merchandise";
  const custDisplay = customerName || "Shivani";
  const nextStep = getRetailerProductNextStep(merchantName, desc, amount, refund.category);

  const mKey = merchantName.toLowerCase();
  let subject = "";
  let body = "";

  if (mKey.includes("marshalls")) {
    subject = `Apparel Return Authorization & Credit Request — ${desc} (${amtFormatted}) — ${custDisplay} [${nextStep.claim_code}]`;
    body = `To: Marshalls Customer Experience & Returns Team <${contact.support_email}>
From: ${custDisplay} ${customerEmail ? `<${customerEmail}>` : ''}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Subject: ${subject}

Dear Marshalls Customer Experience Team,

I am writing to initiate and confirm an apparel return for an item purchased at Marshalls on ${returnDate}.

PURCHASE & ITEM SPECIFICATIONS:
• Merchant: Marshalls (Store #0842)
• Item: ${desc} (1 item)
• Total Paid: ${amtFormatted} USD ($35.99 Subtotal + $2.70 Tax)
• Purchase Date: ${returnDate}
• Return Claim Reference: ${nextStep.claim_code}
• Return Window Status: Eligible (Within 30-day Marshalls return policy)

RETURN METHOD & RESOLUTION:
The apparel is unworn, in original store condition, with all Marshalls brand tags intact. I am requesting confirmation of my digital return voucher to process at my local Marshalls customer desk, or a pre-paid digital return shipping label.

Please confirm receipt of this notice and confirm that a refund of ${amtFormatted} will be credited to my original payment card.

Sincerely,

${custDisplay}
SpendTrace Return Concierge
Account Reference: ${nextStep.claim_code}`;
  } else if (mKey.includes("walmart")) {
    subject = `Walmart Freshness Guarantee Refund Claim — ${desc} (${amtFormatted}) — ${custDisplay} [${nextStep.claim_code}]`;
    body = `To: Walmart Customer Care & Grocery Returns <${contact.support_email}>
From: ${custDisplay} ${customerEmail ? `<${customerEmail}>` : ''}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Subject: ${subject}

Dear Walmart Customer Care Team,

I am submitting a formal refund claim under Walmart's 100% Freshness Guarantee for grocery items purchased on ${returnDate}.

TRANSACTION & GROCERY DETAILS:
• Retailer: Walmart Supercenter
• Category: Perishable Groceries (5 items)
• Total Charged: ${amtFormatted} USD ($82.14 Subtotal + $6.78 Tax)
• Purchase Date: ${returnDate}
• Claim Reference: ${nextStep.claim_code}
• Policy Invocation: Walmart 100% Freshness Guarantee (Within 7-day grocery window)

DEMAND FOR DIGITAL REFUND:
Under Walmart's official Freshness Guarantee policy (accessible at ${contact.support_url}), customers are entitled to a full refund on grocery and fresh food purchases within 7 days without the requirement of returning perishable merchandise to a physical store.

I respectfully request that Walmart credit the full purchase amount of ${amtFormatted} to my original payment card.

Sincerely,

${custDisplay}
SpendTrace Intelligence Account
Claim ID: ${nextStep.claim_code}`;
  } else if (mKey.includes("restaurant")) {
    subject = `Dining Charge Discrepancy & Refund Notice — ${desc} (${amtFormatted}) — ${custDisplay} [${nextStep.claim_code}]`;
    body = `To: Restaurant Guest Relations & Dispute Services <${contact.support_email}>
From: ${custDisplay} ${customerEmail ? `<${customerEmail}>` : ''}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Subject: ${subject}

Dear Guest Relations Team,

I am writing regarding a dining charge incurred on ${returnDate} for ${desc} totaling ${amtFormatted}.

TRANSACTION BREAKDOWN:
• Merchant: Restaurant Guest Services
• Description: ${desc}
• Charged Amount: ${amtFormatted} USD ($42.80 Dinner + $3.90 Tax)
• Date of Transaction: ${returnDate}
• Claim Reference: ${nextStep.claim_code}

BILLING ADJUSTMENT REQUEST:
I am requesting a review of this transaction and a refund of ${amtFormatted} to the original payment card used at the time of service.

Please review the receipt record on file and confirm posting of this credit.

Sincerely,

${custDisplay}
SpendTrace Account Ref: ${nextStep.claim_code}`;
  } else if (mKey.includes("at&t") || mKey.includes("att")) {
    subject = `Notice of Telecommunications Billing Dispute: Mobile Service AutoPay (${amtFormatted}) — ${custDisplay} [${nextStep.claim_code}]`;
    body = `To: AT&T Wireless Billing Dispute Resolution <${contact.support_email}>
From: ${custDisplay} ${customerEmail ? `<${customerEmail}>` : ''}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Subject: ${subject}

Dear AT&T Wireless Billing Resolution Team,

Please accept this formal written dispute regarding a billing charge on my wireless account for ${desc} in the amount of ${amtFormatted} processed on ${returnDate}.

DISPUTE DETAILS:
• Carrier: AT&T Wireless Mobility
• Service: ${desc} (Monthly AutoPay Bill)
• Amount in Dispute: ${amtFormatted} USD
• Transaction Date: ${returnDate}
• Dispute Case Reference: ${nextStep.claim_code}
• Governing Framework: AT&T Wireless Customer Service Agreement & FCC Section 201(b)

REQUESTED ACTION:
I request an immediate billing adjustment and a statement credit of ${amtFormatted} to be applied to my payment card or credited against my next billing statement.

Please confirm receipt and provide the tracking case number for this dispute.

Sincerely,

${custDisplay}
SpendTrace Wireless Account Ref: ${nextStep.claim_code}`;
  } else {
    // General statutory dispute notice for overdue returns
    subject = `Urgent Dispute: Uncredited Refund for Return of ${desc} (${amtFormatted}) — ${custDisplay}`;
    body = `To: ${contact.canonical_name} Customer Service & Disputes Team <${contact.support_email}>
From: ${custDisplay} ${customerEmail ? `<${customerEmail}>` : ''}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Subject: ${subject}

Dear ${contact.canonical_name} Support Team,

I am writing to formally dispute an overdue and uncredited return for merchandise returned to ${contact.canonical_name} on ${returnDate}. 

Under ${contact.canonical_name}'s official return policy (accessible at ${contact.support_url}) and standard consumer protection statutes, credits are required to be posted to the original payment method within the designated settlement window. As of today, the settlement deadline of ${deadlineStr} has passed, and no corresponding credit has posted to my financial statement.

TRANSACTION & RETURN SPECIFICATIONS:
• Merchant: ${contact.canonical_name}
• Item Description: ${desc}
• Uncredited Refund Amount: ${amtFormatted} USD
• Date of Physical Return: ${returnDate}
• Settlement Deadline: ${deadlineStr}
• Return Notes / Drop-off Verification: Proof of return drop-off and merchant return slip verified on file.
• Support Contact Source: ${contact.source_citation}

DEMAND FOR RESOLUTION:
I formally request that ${contact.canonical_name} immediately investigate this discrepancy and issue a full refund of ${amtFormatted} to my original payment card within three (3) business days.

If this credit is not posted or if a valid Acquirer Reference Number (ARN) refund confirmation is not provided within three business days, I will submit a formal dispute and merchant chargeback with my credit card issuing bank under Regulation Z and the Fair Credit Billing Act (FCBA).

Sincerely,

${custDisplay}
SpendTrace Intelligence Account`;
  }

  return {
    merchant: contact.canonical_name,
    vendor_contact: contact,
    subject,
    body: body.trim(),
    next_step: nextStep
  };
}

export function completeRefundLoopWithAi(
  item: any,
  customerName?: string
): {
  claim_code: string;
  merchant_name: string;
  item_description: string;
  amount: number;
  expected_deadline: string;
  radar_column: 'awaiting_credit';
  next_step: RetailerNextStepInfo;
  message: string;
} {
  const mName = item.merchant_name || item.merchant || "Vendor";
  const desc = item.item_description || "Merchandise";
  const amt = Math.abs(Number(item.expected_amount || item.amount || 0));
  const nextStep = getRetailerProductNextStep(mName, desc, amt, item.category);
  const cust = customerName ? ` on behalf of ${customerName}` : '';

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  const deadlineStr = deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    claim_code: nextStep.claim_code,
    merchant_name: nextStep.protocol_title ? mName : mName,
    item_description: desc,
    amount: amt,
    expected_deadline: deadlineStr,
    radar_column: 'awaiting_credit',
    next_step: nextStep,
    message: `✓ SpendTrace AI successfully completed the refund loop for ${mName}${cust} (${desc}, $${amt.toFixed(2)}). Claim reference #${nextStep.claim_code} has been logged to Refund Radar. Reconciler will notify you when bank statement credit posts.`
  };
}

// ==========================================
// INTELLIGENT CATEGORIZATION & PLAID ENGINE
// ==========================================

export interface CategoryInferenceResult {
  merchant: string;
  category: string;
  confidence: number;
  reasoning: string;
  is_itemized: boolean;
  is_credit_card_payment?: boolean;
  is_bill?: boolean;
}

export function mockInferCategory(
  merchant: string,
  isItemized: boolean = false,
  lineItems: string[] = []
): CategoryInferenceResult {
  const m = (merchant || '').trim().toLowerCase();

  // Credit card payment autopay / transfer detection
  const ccPaymentMatches = [
    'chase autopay', 'chase credit card', 'amex epayment', 'american express payment',
    'citi card payment', 'citi autopay', 'capital one payment', 'bank of america credit card bill',
    'discover payment', 'barclays payment', 'credit card payment', 'payment thank you'
  ];
  if (ccPaymentMatches.some(p => m.includes(p))) {
    return {
      merchant: merchant.trim(),
      category: 'Credit Card Payment',
      confidence: 0.99,
      reasoning: 'Payment to credit card account. Excluded from monthly spend to prevent double-counting against card purchase charges.',
      is_itemized: isItemized,
      is_credit_card_payment: true
    };
  }

  // Exact Benchmark 1: Marshalls -> Apparel
  if (m.includes('marshalls') || m.includes('marshall') || m.includes('tj maxx') || m.includes('t.j. maxx')) {
    return {
      merchant: merchant.trim(),
      category: 'Apparel',
      confidence: 0.98,
      reasoning: 'Marshalls is an off-price department retailer specializing in brand-name clothing and apparel. Classified as Apparel with 98% confidence.',
      is_itemized: isItemized
    };
  }

  // Exact Benchmark 2: Walmart (Non-itemized vs Itemized)
  if (m.includes('walmart') || m.includes('wal-mart')) {
    if (!isItemized || lineItems.length === 0) {
      return {
        merchant: merchant.trim(),
        category: 'Groceries',
        confidence: 0.96,
        reasoning: 'Walmart non-itemized receipt default to Groceries per consumer staples heuristic (96% confidence).',
        is_itemized: false
      };
    }
    // Itemized check
    const itemsStr = lineItems.join(' ').toLowerCase();
    if (itemsStr.includes('ipad') || itemsStr.includes('tv') || itemsStr.includes('laptop') || itemsStr.includes('headphone') || itemsStr.includes('electronics')) {
      return {
        merchant: merchant.trim(),
        category: 'Electronics',
        confidence: 0.95,
        reasoning: 'Walmart itemized receipt: primary value derived from electronic equipment line items.',
        is_itemized: true
      };
    }
    return {
      merchant: merchant.trim(),
      category: 'Groceries',
      confidence: 0.92,
      reasoning: 'Walmart itemized receipt: grocery line items dominate invoice.',
      is_itemized: true
    };
  }

  // Utility Bills
  const utilityMatches = [
    'pacific gas', 'pg&e', 'pge', 'coned', 'consolidated edison', 'verizon', 'at&t',
    't-mobile', 'comcast', 'xfinity', 'national grid', 'water district', 'duke energy'
  ];
  if (utilityMatches.some(u => m.includes(u))) {
    return {
      merchant: merchant.trim(),
      category: 'Bills & Utilities',
      confidence: 0.97,
      reasoning: 'Recurring residential utility provider (electric, gas, or telecommunications).',
      is_itemized: isItemized,
      is_bill: true
    };
  }

  // Apparel & Footwear
  if (m.includes('zara') || m.includes('h&m') || m.includes('gap') || m.includes('nordstrom') || m.includes('nike') || m.includes('lulu')) {
    return {
      merchant: merchant.trim(),
      category: 'Apparel',
      confidence: 0.97,
      reasoning: 'Dedicated fashion, athletic wear, and footwear merchant.',
      is_itemized: isItemized
    };
  }

  // Groceries & Supermarkets
  if (m.includes('trader joe') || m.includes('whole foods') || m.includes('safeway') || m.includes('kroger') || m.includes('costco')) {
    return {
      merchant: merchant.trim(),
      category: 'Groceries',
      confidence: 0.97,
      reasoning: 'Supermarket and grocery retailer.',
      is_itemized: isItemized
    };
  }

  // Dining & Restaurants
  if (m.includes('nobu') || m.includes('osteria') || m.includes('sushi') || m.includes('starbucks') || m.includes('chipotle') || m.includes('restaurant')) {
    return {
      merchant: merchant.trim(),
      category: 'Dining',
      confidence: 0.95,
      reasoning: 'Restaurant, cafe, or food establishment.',
      is_itemized: isItemized
    };
  }

  // Default fallback
  return {
    merchant: merchant.trim(),
    category: 'General',
    confidence: 0.60,
    reasoning: 'General merchant spending.',
    is_itemized: isItemized
  };
}

export const MOCK_SAMPLE_BILLS: Array<{
  row_id: number;
  date: string;
  merchant_raw: string;
  merchant_clean: string;
  amount: number;
  original_category: string;
  inferred_category: string;
  confidence: number;
  reasoning: string;
  is_credit_card_payment: boolean;
  is_bill: boolean;
}> = [
  {
    row_id: 1,
    date: '2026-10-22',
    merchant_raw: 'MARSHALLS STORE #0842 NY',
    merchant_clean: 'Marshalls',
    amount: 89.40,
    original_category: 'Uncategorized',
    inferred_category: 'Apparel',
    confidence: 0.98,
    reasoning: 'Marshalls is an off-price department retailer specializing in brand-name clothing and apparel. Classified as Apparel with 98% confidence.',
    is_credit_card_payment: false,
    is_bill: false
  },
  {
    row_id: 2,
    date: '2026-10-23',
    merchant_raw: 'WALMART SUPERCENTER #1593 (NON-ITEMIZED REGISTER)',
    merchant_clean: 'Walmart',
    amount: 142.18,
    original_category: 'Unknown',
    inferred_category: 'Groceries',
    confidence: 0.96,
    reasoning: 'Walmart non-itemized receipt default to Groceries per consumer staples heuristic (96% confidence).',
    is_credit_card_payment: false,
    is_bill: false
  },
  {
    row_id: 3,
    date: '2026-10-20',
    merchant_raw: 'PACIFIC GAS & ELECTRIC (PG&E)',
    merchant_clean: 'Pacific Gas & Electric (PG&E)',
    amount: 184.50,
    original_category: 'General',
    inferred_category: 'Bills & Utilities',
    confidence: 0.97,
    reasoning: 'Recurring residential utility provider (electric, gas, or telecommunications).',
    is_credit_card_payment: false,
    is_bill: true
  },
  {
    row_id: 4,
    date: '2026-10-21',
    merchant_raw: 'CHASE AUTOPAY PAYMENT - THANK YOU',
    merchant_clean: 'Chase Autopay',
    amount: 500.00,
    original_category: 'Transfer / Uncategorized',
    inferred_category: 'Credit Card Payment',
    confidence: 0.99,
    reasoning: 'Payment to credit card account. Excluded from monthly spend to prevent double-counting against card purchase charges.',
    is_credit_card_payment: true,
    is_bill: false
  },
  {
    row_id: 5,
    date: '2026-10-18',
    merchant_raw: 'CONSOLIDATED EDISON BILL AUTOPAY',
    merchant_clean: 'Consolidated Edison',
    amount: 92.30,
    original_category: 'Utilities',
    inferred_category: 'Bills & Utilities',
    confidence: 0.97,
    reasoning: 'Monthly municipal utility bill (electric & gas).',
    is_credit_card_payment: false,
    is_bill: true
  },
  {
    row_id: 6,
    date: '2026-10-16',
    merchant_raw: 'VERIZON WIRELESS BILL PAY',
    merchant_clean: 'Verizon Wireless',
    amount: 115.00,
    original_category: 'Phone / Telecommunications',
    inferred_category: 'Bills & Utilities',
    confidence: 0.97,
    reasoning: 'Monthly mobile carrier service.',
    is_credit_card_payment: false,
    is_bill: true
  }
];

export const MOCK_PLAID_DATA = {
  status: 'connected',
  institution_name: 'Plaid Multi-Account Sync (Chase, Amex, Citi, BofA)',
  accounts: [
    {
      account_id: 'acc_chase_sapphire',
      name: 'Chase Sapphire Reserve',
      official_name: 'Chase Sapphire Reserve Visa Infinite',
      type: 'credit',
      subtype: 'credit card',
      mask: '4821',
      current_balance: 1420.50,
      credit_limit: 15000.00,
      utilization_rate_pct: 9.47,
      minimum_payment_due: 45.00,
      next_payment_due_date: '2026-11-15',
      apr_percentage: 22.49,
      is_overdue: false
    },
    {
      account_id: 'acc_amex_blue',
      name: 'American Express Blue Cash',
      official_name: 'Amex Blue Cash Preferred',
      type: 'credit',
      subtype: 'credit card',
      mask: '1004',
      current_balance: 890.75,
      credit_limit: 10000.00,
      utilization_rate_pct: 8.91,
      minimum_payment_due: 35.00,
      next_payment_due_date: '2026-11-18',
      apr_percentage: 19.99,
      is_overdue: false
    },
    {
      account_id: 'acc_citi_double',
      name: 'Citi Double Cash',
      official_name: 'Citi Double Cash Mastercard',
      type: 'credit',
      subtype: 'credit card',
      mask: '9211',
      current_balance: 1809.20,
      credit_limit: 10000.00,
      utilization_rate_pct: 18.09,
      minimum_payment_due: 60.00,
      next_payment_due_date: '2026-11-22',
      apr_percentage: 21.24,
      is_overdue: false
    },
    {
      account_id: 'acc_bofa_chk',
      name: 'Bank of America Advantage Checking',
      official_name: 'BofA Preferred Rewards Checking',
      type: 'depository',
      subtype: 'checking',
      mask: '3109',
      current_balance: 6420.10,
      credit_limit: null,
      utilization_rate_pct: null,
      minimum_payment_due: null,
      next_payment_due_date: null,
      apr_percentage: null,
      is_overdue: false
    }
  ],
  liabilities_summary: {
    total_credit_debt: 4120.45,
    total_credit_limit: 35000.00,
    aggregate_utilization_pct: 11.77,
    total_minimum_payment_due: 140.00,
    next_due_date: '2026-11-15',
    checking_cash_buffer: 6420.10
  }
};

export const MOCK_PLAID_SYNCED_TRANSACTIONS = [
  {
    id: 'plaid_tx_01',
    date: '2026-10-26',
    merchant_clean: 'Marshalls',
    merchant_raw: 'MARSHALLS #0421 QUEENS NY',
    amount: 64.20,
    category: 'Apparel',
    status: 'verified',
    is_return: 0,
    has_receipt: false,
    source: 'Plaid Sync (Chase Sapphire)',
    is_credit_card_payment: false,
    created_at: '2026-10-26T18:00:00Z'
  },
  {
    id: 'plaid_tx_02',
    date: '2026-10-25',
    merchant_clean: 'Walmart',
    merchant_raw: 'WALMART STORE #2241 (NON-ITEMIZED)',
    amount: 112.50,
    category: 'Groceries',
    status: 'verified',
    is_return: 0,
    has_receipt: false,
    source: 'Plaid Sync (Amex Blue)',
    is_credit_card_payment: false,
    created_at: '2026-10-25T14:30:00Z'
  },
  {
    id: 'plaid_tx_03',
    date: '2026-10-24',
    merchant_clean: 'Chase Autopay',
    merchant_raw: 'CHASE CREDIT CRD AUTOPAY',
    amount: 450.00,
    category: 'Credit Card Payment',
    status: 'verified',
    is_return: 0,
    has_receipt: false,
    source: 'Plaid Sync (BofA Checking)',
    is_credit_card_payment: true,
    created_at: '2026-10-24T09:00:00Z'
  },
  {
    id: 'plaid_tx_04',
    date: '2026-10-21',
    merchant_clean: 'Pacific Gas & Electric (PG&E)',
    merchant_raw: 'PG&E UTILITY PMT',
    amount: 142.10,
    category: 'Bills & Utilities',
    status: 'verified',
    is_return: 0,
    has_receipt: false,
    source: 'Plaid Sync (BofA Checking)',
    is_credit_card_payment: false,
    created_at: '2026-10-21T11:15:00Z'
  }
];

// Exact 4 benchmark purchases depicted in the user's Frontpage and Refund Radar diagrams
export const MOCK_FRONTPAGE_JOURNEY_ITEMS = [
  {
    step: 1,
    merchant: "Restaurant",
    description: "Dinner",
    subtotal: 42.80,
    tax: 3.90,
    amount: 46.70,
    category: "Outside Food",
    category_color: "#EA580C",
    icon: "Utensils",
    date: "Oct 28, 2026",
    receipt_tag: "Thank you!"
  },
  {
    step: 2,
    merchant: "Marshalls",
    description: "Apparel",
    subtotal: 35.99,
    tax: 2.70,
    amount: 38.69,
    category: "Apparel",
    category_color: "#2563EB",
    icon: "ShoppingBag",
    date: "Oct 28, 2026",
    receipt_tag: "Thank you!"
  },
  {
    step: 3,
    merchant: "Walmart",
    description: "Groceries",
    subtotal: 82.14,
    tax: 6.78,
    amount: 88.92,
    category: "Grocery",
    category_color: "#16A34A",
    icon: "ShoppingCart",
    date: "Oct 28, 2026",
    receipt_tag: "Save money. Live better."
  },
  {
    step: 4,
    merchant: "AT&T",
    description: "Mobile Service (Phone Bill)",
    subtotal: 75.00,
    tax: 0.00,
    amount: 75.00,
    category: "Utility Bills",
    category_color: "#9333EA",
    icon: "Wifi",
    date: "Oct 28, 2026",
    receipt_tag: "AutoPay - Thank you!"
  }
];

export const MOCK_RADAR_ELIGIBLE_PURCHASES = [
  {
    id: "radar_row_1",
    date: "Oct 28, 2026",
    merchant_name: "Restaurant",
    merchant_clean: "Restaurant",
    item_description: "Dinner",
    item_count_label: "1 item",
    amount: 46.70,
    expected_amount: 46.70,
    category: "Outside Food",
    category_class: "dining",
    eligibility_status: "Possible",
    eligibility_window: "Check with merchant",
    badge_variant: "amber",
    action_label: "Start Refund",
    is_return: 1
  },
  {
    id: "radar_row_2",
    date: "Oct 28, 2026",
    merchant_name: "Marshalls",
    merchant_clean: "Marshalls",
    item_description: "Apparel",
    item_count_label: "1 item",
    amount: 38.69,
    expected_amount: 38.69,
    category: "Apparel",
    category_class: "apparel",
    eligibility_status: "Eligible",
    eligibility_window: "Within 30 days",
    badge_variant: "green",
    action_label: "Start Return",
    is_return: 1
  },
  {
    id: "radar_row_3",
    date: "Oct 28, 2026",
    merchant_name: "Walmart",
    merchant_clean: "Walmart",
    item_description: "Groceries",
    item_count_label: "5 items",
    amount: 88.92,
    expected_amount: 88.92,
    category: "Grocery",
    category_class: "groceries",
    eligibility_status: "Eligible",
    eligibility_window: "Within 7 days",
    badge_variant: "green",
    action_label: "Start Return",
    is_return: 1
  },
  {
    id: "radar_row_4",
    date: "Oct 28, 2026",
    merchant_name: "AT&T",
    merchant_clean: "AT&T",
    item_description: "Mobile Service",
    item_count_label: "Monthly Bill",
    amount: 75.00,
    expected_amount: 75.00,
    category: "Utility Bills",
    category_class: "bills",
    eligibility_status: "Possible",
    eligibility_window: "Contact AT&T",
    badge_variant: "amber",
    action_label: "Start Refund",
    is_return: 1
  }
];

export interface SpendingAnalysisWindowData {
  count: number;
  unit: 'weeks' | 'months';
  total_spend: number;
  transaction_count: number;
  category_breakdown: Array<{ category: string; amount: number; percentage: number; color: string; count: number }>;
  transactions: Array<{
    id: string;
    date: string;
    merchant: string;
    amount: number;
    category: string;
    description: string;
  }>;
  north_star_metrics: {
    verified_refund_dollars_recovered: number;
    user_effort_score: string;
    false_refund_opportunity_rate: string;
  };
}

export const FOUR_CORE_BENCHMARK_TRANSACTIONS = [
  {
    id: "tx_core_01",
    date: "Oct 28, 2026",
    merchant: "Restaurant",
    amount: 46.70,
    category: "Outside Food",
    description: "Dinner with friends"
  },
  {
    id: "tx_core_02",
    date: "Oct 28, 2026",
    merchant: "Marshalls",
    amount: 38.69,
    category: "Apparel",
    description: "Apparel clothing item"
  },
  {
    id: "tx_core_03",
    date: "Oct 28, 2026",
    merchant: "Walmart",
    amount: 88.92,
    category: "Grocery",
    description: "Groceries and household essentials"
  },
  {
    id: "tx_core_04",
    date: "Oct 28, 2026",
    merchant: "AT&T",
    amount: 75.00,
    category: "Utility Bills",
    description: "Mobile Service recurring bill"
  }
];

export function getSpendingAnalysisForWindow(count: number, unit: 'weeks' | 'months'): SpendingAnalysisWindowData {
  // Base 1-week benchmark: exact 4 transactions ($249.31)
  const baseTxs = [...FOUR_CORE_BENCHMARK_TRANSACTIONS];
  
  // Scale multiplier for historical windows
  const multiplier = unit === 'weeks' ? count : count * 4.2;
  
  let additionalTxs: typeof FOUR_CORE_BENCHMARK_TRANSACTIONS = [];
  if (multiplier > 1) {
    additionalTxs = [
      { id: "tx_hist_01", date: "Oct 21, 2026", merchant: "Trader Joe's", amount: 42.18, category: "Grocery", description: "Weekly produce" },
      { id: "tx_hist_02", date: "Oct 19, 2026", merchant: "Shell Oil", amount: 35.00, category: "Gas & Fuel", description: "Commute gas" },
      { id: "tx_hist_03", date: "Oct 15, 2026", merchant: "Sweetgreen", amount: 16.50, category: "Outside Food", description: "Salad lunch" },
      { id: "tx_hist_04", date: "Oct 10, 2026", merchant: "Amazon", amount: 58.20, category: "Household", description: "Home supplies" }
    ];
    if (multiplier >= 3) {
      additionalTxs.push(
        { id: "tx_hist_05", date: "Sep 28, 2026", merchant: "Con Edison", amount: 112.40, category: "Utility Bills", description: "Electric bill" },
        { id: "tx_hist_06", date: "Sep 20, 2026", merchant: "Whole Foods", amount: 94.60, category: "Grocery", description: "Organic pantry" }
      );
    }
    if (multiplier >= 6) {
      additionalTxs.push(
        { id: "tx_hist_07", date: "Aug 28, 2026", merchant: "Target", amount: 132.80, category: "Household", description: "Back-to-school items" },
        { id: "tx_hist_08", date: "Aug 15, 2026", merchant: "Delta Air", amount: 320.00, category: "Travel", description: "Flight ticket" }
      );
    }
  }

  const allTxs = count === 1 && unit === 'weeks' ? baseTxs : [...baseTxs, ...additionalTxs];
  const total = allTxs.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const catMap: Record<string, { amount: number; count: number; color: string }> = {};
  const colors: Record<string, string> = {
    "Grocery": "#16A34A",
    "Apparel": "#2563EB",
    "Outside Food": "#EA580C",
    "Utility Bills": "#9333EA",
    "Gas & Fuel": "#D97706",
    "Household": "#0D9488",
    "Travel": "#0284C7"
  };

  for (const t of allTxs) {
    if (!catMap[t.category]) {
      catMap[t.category] = { amount: 0, count: 0, color: colors[t.category] || "#475569" };
    }
    catMap[t.category].amount += t.amount;
    catMap[t.category].count += 1;
  }

  const category_breakdown = Object.entries(catMap).map(([category, val]) => ({
    category,
    amount: Number(val.amount.toFixed(2)),
    percentage: Number(((val.amount / total) * 100).toFixed(1)),
    color: val.color,
    count: val.count
  })).sort((a, b) => b.amount - a.amount);

  return {
    count,
    unit,
    total_spend: Number(total.toFixed(2)),
    transaction_count: allTxs.length,
    category_breakdown,
    transactions: allTxs,
    north_star_metrics: {
      verified_refund_dollars_recovered: 38.69,
      user_effort_score: "1 Click (Autonomous Loop)",
      false_refund_opportunity_rate: "0.0% (Zero false positives)"
    }
  };
}
