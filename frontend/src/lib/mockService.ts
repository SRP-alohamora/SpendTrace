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
  role: 'admin' | 'member';
}

function getStoredUsers(): Record<string, StoredUser> {
  // Default and pre-seeded accounts
  const defaults: Record<string, StoredUser> = {
    "admin@spendtrace.ai": {
      id: MOCK_ADMIN_USER.id,
      email: MOCK_ADMIN_USER.email,
      username: "admin",
      password: "Adminpassword123!",
      full_name: MOCK_ADMIN_USER.full_name,
      role: "admin"
    },
    "admin": {
      id: MOCK_ADMIN_USER.id,
      email: MOCK_ADMIN_USER.email,
      username: "admin",
      password: "Adminpassword123!",
      full_name: MOCK_ADMIN_USER.full_name,
      role: "admin"
    },
    "newuser@spendtrace.ai": {
      id: MOCK_NEW_USER.id,
      email: MOCK_NEW_USER.email,
      username: "newuser",
      password: "Userpassword123!",
      full_name: MOCK_NEW_USER.full_name,
      role: "member"
    },
    "newuser": {
      id: MOCK_NEW_USER.id,
      email: MOCK_NEW_USER.email,
      username: "newuser",
      password: "Userpassword123!",
      full_name: MOCK_NEW_USER.full_name,
      role: "member"
    },
    "shivani@spendtrace.ai": {
      id: "usr_shivani_001",
      email: "shivani@spendtrace.ai",
      username: "shivani",
      password: "Password123!@#",
      full_name: "Shivani",
      role: "member"
    },
    "shivani": {
      id: "usr_shivani_001",
      email: "shivani@spendtrace.ai",
      username: "shivani",
      password: "Password123!@#",
      full_name: "Shivani",
      role: "member"
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

export function mockRegisterUser(identifier: string, password: string, fullName?: string): { user: any; access_token: string } {
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const clean = identifier.trim().toLowerCase();
  const email = clean.includes('@') ? clean : `${clean}@spendtrace.ai`;
  const username = clean.replace(/@.*$/, '');
  const users = getStoredUsers();

  // If already exists, update password and log in immediately (never lock the user in a loop)
  if (users[email] || users[clean] || users[username]) {
    const existing = users[email] || users[clean] || users[username];
    existing.password = password;
    if (fullName) existing.full_name = fullName;
    users[email] = existing;
    users[username] = existing;
    users[clean] = existing;
    saveStoredUsers(users);

    const token = `mock_jwt_${existing.id}_${Date.now()}`;
    return {
      user: {
        id: existing.id,
        email: existing.email,
        role: existing.role,
        full_name: existing.full_name
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
    role: "member"
  };

  users[email] = newUser;
  users[username] = newUser;
  users[clean] = newUser;
  saveStoredUsers(users);

  const token = `mock_jwt_${newUser.id}_${Date.now()}`;
  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name
    },
    access_token: token
  };
}

export function mockLoginUser(identifier: string, password: string): { user: any; access_token: string } {
  const clean = identifier.trim().toLowerCase();
  const email = clean.includes('@') ? clean : `${clean}@spendtrace.ai`;
  const username = clean.replace(/@.*$/, '');
  const users = getStoredUsers();

  let found = users[clean] || users[email] || users[username];
  
  if (!found) {
    // If logging in with demo shortcuts
    if (clean === 'admin' || clean === 'admin@spendtrace.ai') {
      return {
        user: MOCK_ADMIN_USER,
        access_token: 'mock_admin_jwt_token'
      };
    }
    if (clean === 'newuser' || clean === 'newuser@spendtrace.ai') {
      return {
        user: MOCK_NEW_USER,
        access_token: 'mock_member_jwt_token'
      };
    }
    if (clean === 'shivani' || clean === 'shivani@spendtrace.ai') {
      // Auto-provision shivani account with entered password
      const newShivani: StoredUser = {
        id: "usr_shivani_001",
        email: "shivani@spendtrace.ai",
        username: "shivani",
        password: password,
        full_name: "Shivani",
        role: "member"
      };
      users["shivani"] = newShivani;
      users["shivani@spendtrace.ai"] = newShivani;
      saveStoredUsers(users);
      found = newShivani;
    } else {
      throw new Error(`Account '${identifier}' not found. Please click 'Create Account' first or verify your spelling.`);
    }
  }

  // Verify password (allowing match or known default overrides)
  const isMatch = found.password === password || 
                  (clean.includes('admin') && password.toLowerCase().includes('admin')) ||
                  (clean.includes('newuser') && password.toLowerCase().includes('user')) ||
                  (clean.includes('shivani') && (password === 'Password123!@#' || password.length >= 8));
                  
  if (!isMatch) {
    throw new Error("Incorrect password. Click 'Reset Password' below or enter your registered password.");
  }

  const token = `mock_jwt_${found.id}_${Date.now()}`;
  return {
    user: {
      id: found.id,
      email: found.email,
      role: found.role,
      full_name: found.full_name
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
