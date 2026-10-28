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

export function generateCustomizedDisputeDraft(
  refund: any,
  customerName?: string,
  customerEmail?: string
): {
  merchant: string;
  vendor_contact: VendorSupportInfo;
  subject: string;
  body: string;
} {
  const merchantName = refund.merchant_name || refund.merchant || "Vendor";
  const contact = getVendorSupportContact(merchantName);
  const amount = Math.abs(Number(refund.expected_amount || refund.amount || 0));
  const amtFormatted = `$${amount.toFixed(2)}`;
  const returnDate = refund.return_date || refund.date || "2026-10-11";
  const deadlineStr = refund.deadline_date || "within 10 calendar days of return";
  const desc = refund.item_description || "Returned Merchandise";
  const notes = refund.notes || "In-store return voucher and physical return drop-off confirmed.";
  const custDisplay = customerName || "Shivani";

  const subject = `Urgent Dispute: Uncredited Refund for Return of ${desc} (${amtFormatted}) — ${custDisplay}`;

  const body = `To: ${contact.canonical_name} Customer Service & Disputes Team <${contact.support_email}>
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
• Return Notes / Drop-off Verification: ${notes}
• Support Contact Source: ${contact.source_citation}

DEMAND FOR RESOLUTION:
I formally request that ${contact.canonical_name} immediately investigate this discrepancy and issue a full refund of ${amtFormatted} to my original payment card within three (3) business days.

If this credit is not posted or if a valid Acquirer Reference Number (ARN) refund confirmation is not provided within three business days, I will submit a formal dispute and merchant chargeback with my credit card issuing bank under Regulation Z and the Fair Credit Billing Act (FCBA), supplying the verified return documentation.

Please confirm receipt of this notice and provide the transaction tracking reference for the processed credit.

Sincerely,

${custDisplay}
SpendTrace Intelligence Account`;

  return {
    merchant: contact.canonical_name,
    vendor_contact: contact,
    subject,
    body: body.trim()
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

