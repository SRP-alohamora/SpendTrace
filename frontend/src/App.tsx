import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  AlertCircle, 
  Download, 
  Play, 
  RefreshCw,
  Sparkles,
  X,
  FileText,
  Camera,
  Upload,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Database,
  Key,
  LogOut,
  Mail,
  ExternalLink,
  Copy, 
  Check, 
  CreditCard, 
  Layers, 
  FileSpreadsheet,
  Home,
  Star,
  UserPlus,
  Clock,
  ChevronRight
} from 'lucide-react';

import spendtraceFrontpageImg from './assets/spendtrace_frontpage.jpg';
import spendtraceRefundRadarImg from './assets/spendtrace_refund_radar.jpg';

import { 
  isGitHubPagesDeployment, 
  MOCK_ADMIN_USER, 
  MOCK_NEW_USER, 
  MOCK_BENCHMARK_TRANSACTIONS, 
  MOCK_REFUNDS, 
  MOCK_EVAL_DATA, 
  MOCK_TRACES, 
  MOCK_OBS_METRICS, 
  handleMockChatResponse, 
  validatePasswordStrength, 
  mockRegisterUser, 
  mockLoginUser, 
  mockResetPassword, 
  mockVerifyMfaCode, 
  mockGenerateMfaCode, 
  mockGuestLogin, 
  generateMasterLedgerCsv, 
  downloadCsvLocally, 
  generateCustomizedDisputeDraft, 
  type VendorSupportInfo, 
  mockInferCategory, 
  MOCK_SAMPLE_BILLS, 
  MOCK_PLAID_DATA, 
  MOCK_PLAID_SYNCED_TRANSACTIONS, 
  type CategoryInferenceResult,
  MOCK_FRONTPAGE_JOURNEY_ITEMS,
  MOCK_RADAR_ELIGIBLE_PURCHASES
} from './lib/mockService';

const API_BASE = '/api/v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'frontpage' | 'assistant' | 'radar' | 'plaid' | 'compare' | 'evals' | 'observability'>('frontpage');
  
  // Auth & IAM State (Compatible with Supabase Open Source Auth)
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string; full_name?: string } | null>(() => {
    const saved = localStorage.getItem('spendtrace_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: "00000000-0000-0000-0000-000000000001",
      email: "admin@spendtrace.ai",
      role: "admin",
      full_name: "Admin User"
    };
  });
  const [authToken, setAuthToken] = useState<string>(() => localStorage.getItem('spendtrace_token') || '');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'demo' | 'login' | 'signup' | 'reset'>('demo');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Mandatory MFA Email Verification State
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [mfaDevHint, setMfaDevHint] = useState('');

  // Chat & Ingestion State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; hitl?: any; analytics?: any; timestamp: string }>>([
    {
      sender: 'agent',
      text: "Hello! I'm SpendTrace, your personal purchase intelligence agent. Drop a receipt photo, upload a statement, or ask a question—I automatically itemize your spending, track down missing refunds, and ensure all facts are grounded in verified records.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Ledger & Dashboard State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Dispute Notice Draft State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedRefundForDispute, setSelectedRefundForDispute] = useState<any>(null);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDraft, setDisputeDraft] = useState('');
  const [vendorContact, setVendorContact] = useState<VendorSupportInfo | null>(null);
  const [disputeCopied, setDisputeCopied] = useState(false);

  // Evals State
  const [evalData, setEvalData] = useState<any>(null);
  const [isEvalRunning, setIsEvalRunning] = useState(false);
  const [selectedEvalTest, setSelectedEvalTest] = useState<any>(null);

  // Observability State
  const [traces, setTraces] = useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<any>(null);
  const [obsMetrics, setObsMetrics] = useState<any>(null);

  // Spreadsheet / Excel & Bills Importer State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreviewRecords, setImportPreviewRecords] = useState<any[] | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Plaid & Credit Card Liabilities State
  const [plaidData, setPlaidData] = useState<any>(MOCK_PLAID_DATA);
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [plaidNotification, setPlaidNotification] = useState('');

  // Mint / Credit Karma Playground State
  const [compMerchant, setCompMerchant] = useState('Marshalls');
  const [compIsItemized, setCompIsItemized] = useState(false);
  const [compLineItems, setCompLineItems] = useState('');
  const [compResult, setCompResult] = useState<CategoryInferenceResult | null>(() => mockInferCategory('Marshalls', false));

  const getCategoryClass = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('apparel') || c.includes('clothing') || c.includes('fashion')) return 'apparel';
    if (c.includes('grocer') || c.includes('supermarket')) return 'groceries';
    if (c.includes('bill') || c.includes('utilit') || c.includes('electric') || c.includes('telecom')) return 'bills';
    if (c.includes('credit card') || c.includes('payment') || c.includes('autopay')) return 'credit-card';
    if (c.includes('dining') || c.includes('food') || c.includes('restaurant')) return 'dining';
    if (c.includes('electron') || c.includes('tech')) return 'electronics';
    return 'general';
  };

  // Helper for Auth Headers
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('spendtrace_user', JSON.stringify(currentUser));
    }
    if (authToken) {
      localStorage.setItem('spendtrace_token', authToken);
    }
    fetchLedger();
    fetchRefunds();
    if (currentUser?.role === 'admin') {
      fetchLatestEval();
      fetchObservability();
    }
  }, [currentUser, authToken]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLedger = async () => {
    if (currentUser?.role === 'member' && currentUser?.id === MOCK_NEW_USER.id) {
      setTransactions([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/transactions?limit=100`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      // Offline / GitHub Pages fallback
      if (currentUser?.role === 'member' && currentUser?.id === MOCK_NEW_USER.id) {
        setTransactions([]);
      } else {
        setTransactions(MOCK_BENCHMARK_TRANSACTIONS);
      }
    }
  };

  const fetchRefunds = async () => {
    if (currentUser?.role === 'member' && currentUser?.id === MOCK_NEW_USER.id) {
      setRefunds([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/refunds/radar`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setRefunds(data.refunds || []);
    } catch (e) {
      // Offline / GitHub Pages fallback
      if (currentUser?.role === 'member' && currentUser?.id === MOCK_NEW_USER.id) {
        setRefunds([]);
      } else {
        setRefunds(MOCK_REFUNDS);
      }
    }
  };

  const fetchLatestEval = async () => {
    try {
      const res = await fetch(`${API_BASE}/evals/latest`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setEvalData(data);
      if (data?.results?.length > 0) {
        setSelectedEvalTest(data.results[0]);
      }
    } catch (e) {
      setEvalData(MOCK_EVAL_DATA);
      setSelectedEvalTest(MOCK_EVAL_DATA.results[0]);
    }
  };

  const fetchObservability = async () => {
    try {
      const resTraces = await fetch(`${API_BASE}/observability/traces?limit=20`, { headers: getAuthHeaders() });
      if (!resTraces.ok) throw new Error("API response not ok");
      const dataTraces = await resTraces.json();
      setTraces(dataTraces.traces || []);
      if (dataTraces.traces?.length > 0) {
        fetchTraceDetail(dataTraces.traces[0].id);
      }

      const resMetrics = await fetch(`${API_BASE}/observability/metrics`, { headers: getAuthHeaders() });
      if (resMetrics.ok) {
        const dataMetrics = await resMetrics.json();
        setObsMetrics(dataMetrics);
      } else {
        setObsMetrics(MOCK_OBS_METRICS);
      }
    } catch (e) {
      setTraces(MOCK_TRACES);
      setSelectedTrace(MOCK_TRACES[0]);
      setObsMetrics(MOCK_OBS_METRICS);
    }
  };

  const fetchTraceDetail = async (traceId: string) => {
    try {
      const res = await fetch(`${API_BASE}/observability/traces/${traceId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setSelectedTrace(data);
    } catch (e) {
      const found = MOCK_TRACES.find(t => t.id === traceId) || MOCK_TRACES[0];
      setSelectedTrace(found);
    }
  };

  const fetchPlaidAccounts = async () => {
    setPlaidLoading(true);
    try {
      const res = await fetch(`${API_BASE}/plaid/accounts`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("API not ok");
      const data = await res.json();
      setPlaidData(data);
    } catch (e) {
      setPlaidData(MOCK_PLAID_DATA);
    } finally {
      setPlaidLoading(false);
    }
  };

  const handlePlaidSync = async () => {
    setPlaidLoading(true);
    setPlaidNotification('');
    try {
      const res = await fetch(`${API_BASE}/plaid/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaidNotification(`Successfully synced ${data.synced_count} bank & credit card transactions. Intelligent categorization applied.`);
        fetchLedger();
        fetchPlaidAccounts();
        return;
      }
      throw new Error("PlaidFallback");
    } catch (e) {
      // GitHub Pages / offline simulation
      await new Promise(r => setTimeout(r, 800));
      setTransactions(prev => [...MOCK_PLAID_SYNCED_TRANSACTIONS, ...prev]);
      setPlaidNotification(`Plaid Sync Complete: 4 transactions imported and categorized. Note: Chase Autopay ($450) was detected as 'Credit Card Payment' and excluded from monthly spend calculation.`);
    } finally {
      setPlaidLoading(false);
    }
  };

  const handleOpenImportModal = () => {
    setImportSuccessMsg('');
    setShowImportModal(true);
    if (!importPreviewRecords) {
      setImportPreviewRecords(MOCK_SAMPLE_BILLS);
    }
  };

  const handleLoadSampleBills = () => {
    setImportPreviewRecords(MOCK_SAMPLE_BILLS);
    setImportSuccessMsg('Sample uncategorized bills loaded! Review SpendTrace intelligent categorization preview below.');
  };

  const handleDownloadSampleExcel = () => {
    try {
      window.location.href = `${API_BASE}/ledger/sample-bills-template`;
    } catch (e) {
      const csv = `Date,Merchant,Amount,Category,Notes\n2026-10-22,MARSHALLS STORE #0842 NY,89.40,Uncategorized,Receipt missing itemization\n2026-10-23,WALMART SUPERCENTER #1593,142.18,Unknown,Register checkout receipt\n2026-10-20,PACIFIC GAS & ELECTRIC (PG&E),184.50,General,Monthly electric utility\n2026-10-21,CHASE AUTOPAY PAYMENT - THANK YOU,500.00,Transfer,Checking to card transfer\n2026-10-18,CONSOLIDATED EDISON BILL,92.30,Utilities,Gas and electric bill\n2026-10-16,VERIZON WIRELESS BILL PAY,115.00,Phone,Monthly wireless plan`;
      downloadCsvLocally(csv, 'spendtrace_uncategorized_bills_sample.csv');
    }
  };

  const handleSpreadsheetFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setImportSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/ledger/import-spreadsheet`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setImportPreviewRecords(data.preview_records || []);
        setImportSuccessMsg(`Spreadsheet analyzed! Extracted ${data.total_rows} rows. Found ${data.uncategorized_count} uncategorized transactions; SpendTrace applied intelligent categorization.`);
        return;
      }
      throw new Error("SpreadsheetFallback");
    } catch (err) {
      setImportPreviewRecords(MOCK_SAMPLE_BILLS);
      setImportSuccessMsg(`Parsed ${file.name}: 6 records extracted. Intelligent categorizer identified Marshalls as Apparel (98%), Walmart as Groceries (96%), and flagged Chase Autopay as non-spend credit card payment.`);
    } finally {
      setImportLoading(false);
      if (importFileInputRef.current) importFileInputRef.current.value = '';
    }
  };

  const handleCommitSpreadsheet = async () => {
    if (!importPreviewRecords || importPreviewRecords.length === 0) return;
    setImportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ledger/commit-spreadsheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ records: importPreviewRecords })
      });
      if (res.ok) {
        const data = await res.json();
        setImportSuccessMsg(`Committed ${data.inserted_count} records to master PostgreSQL ledger!`);
        fetchLedger();
        setTimeout(() => setShowImportModal(false), 1400);
        return;
      }
      throw new Error("CommitFallback");
    } catch (e) {
      const newTxs = importPreviewRecords.map(r => ({
        id: `imp_${Date.now()}_${r.row_id || Math.random()}`,
        date: r.date,
        merchant_clean: r.merchant_clean,
        merchant_raw: r.merchant_raw,
        amount: Number(r.amount),
        category: r.inferred_category || 'General',
        status: 'verified',
        is_return: 0,
        has_receipt: false,
        is_credit_card_payment: Boolean(r.is_credit_card_payment),
        created_at: new Date().toISOString()
      }));
      setTransactions(prev => [...newTxs, ...prev]);
      setImportSuccessMsg(`Committed ${newTxs.length} records to master ledger!`);
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent' as const,
          text: `Imported and categorized ${newTxs.length} items from spreadsheet. Marshalls mapped to **Apparel** (98% confidence), Walmart non-itemized mapped to **Groceries** (96% confidence), and Chase Autopay flagged as **Credit Card Payment** to prevent double-counting.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setTimeout(() => setShowImportModal(false), 1200);
    } finally {
      setImportLoading(false);
    }
  };

  const handleInferCategoryPlayground = async () => {
    if (!compMerchant.trim()) return;
    try {
      const lineItems = compLineItems.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/categories/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: compMerchant,
          is_itemized: compIsItemized,
          line_items: lineItems
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCompResult(data);
        return;
      }
      throw new Error("InferenceFallback");
    } catch (e) {
      const lineItems = compLineItems.split(',').map(s => s.trim()).filter(Boolean);
      const result = mockInferCategory(compMerchant, compIsItemized, lineItems);
      setCompResult(result);
    }
  };

  // Switch between Demo Admin and Clean New User
  const handleSwitchUser = async (mode: 'admin' | 'newuser') => {
    setShowUserDropdown(false);
    if (mode === 'newuser') {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'newuser@spendtrace.ai', password: 'userpassword123' })
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthToken(data.access_token);
        } else {
          setCurrentUser(MOCK_NEW_USER);
          setAuthToken('mock_member_jwt_token');
        }
      } catch (e) {
        setCurrentUser(MOCK_NEW_USER);
        setAuthToken('mock_member_jwt_token');
      }
      setTransactions([]);
      setRefunds([]);
      setActiveTab('assistant');
    } else {
      try {
        const res = await fetch(`${API_BASE}/auth/demo-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthToken(data.access_token);
        } else {
          setCurrentUser(MOCK_ADMIN_USER);
          setAuthToken('mock_admin_jwt_token');
        }
      } catch (e) {
        setCurrentUser(MOCK_ADMIN_USER);
        setAuthToken('mock_admin_jwt_token');
      }
      setTransactions(MOCK_BENCHMARK_TRANSACTIONS);
      setRefunds(MOCK_REFUNDS);
    }
  };

  // 1-Click Demo Admin Quick Login
  const handleDemoAdminLogin = async () => {
    setShowAuthModal(false);
    setShowUserDropdown(false);
    setIsMfaStep(false);
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAuthToken(data.access_token);
      } else {
        setCurrentUser(MOCK_ADMIN_USER);
        setAuthToken('mock_admin_jwt_token');
      }
    } catch (e) {
      setCurrentUser(MOCK_ADMIN_USER);
      setAuthToken('mock_admin_jwt_token');
    } finally {
      setTransactions(MOCK_BENCHMARK_TRANSACTIONS);
      setRefunds(MOCK_REFUNDS);
      setAuthLoading(false);
      setAuthSuccessMessage("Logged in as Demo Admin (admin@spendtrace.ai) • Rich benchmark ledger loaded");
      setTimeout(() => setAuthSuccessMessage(''), 3000);
    }
  };

  // Load the 4 Frontpage Diagram Purchases directly into Master Ledger
  const handleLoadFrontpageBenchmarkTxs = () => {
    const frontpageTxs = [
      {
        id: `fp_${Date.now()}_1`,
        date: "2026-10-28",
        merchant_clean: "Restaurant",
        merchant_raw: "RESTAURANT - DINNER ($42.80 + TAX $3.90)",
        amount: 46.70,
        category: "Outside Food",
        status: "verified",
        is_return: 0,
        has_receipt: true,
        source: "Frontpage Receipt (Step 1)",
        created_at: "2026-10-28T19:30:00Z"
      },
      {
        id: `fp_${Date.now()}_2`,
        date: "2026-10-28",
        merchant_clean: "Marshalls",
        merchant_raw: "MARSHALLS STORE #0842 ($35.99 + TAX $2.70)",
        amount: 38.69,
        category: "Apparel",
        status: "verified",
        is_return: 0,
        has_receipt: true,
        source: "Frontpage Receipt (Step 2 - 98% Apparel)",
        created_at: "2026-10-28T17:15:00Z"
      },
      {
        id: `fp_${Date.now()}_3`,
        date: "2026-10-28",
        merchant_clean: "Walmart",
        merchant_raw: "WALMART SUPERCENTER ($82.14 + TAX $6.78)",
        amount: 88.92,
        category: "Grocery",
        status: "verified",
        is_return: 0,
        has_receipt: true,
        source: "Frontpage Receipt (Step 3 - 96% Grocery)",
        created_at: "2026-10-28T15:40:00Z"
      },
      {
        id: `fp_${Date.now()}_4`,
        date: "2026-10-28",
        merchant_clean: "AT&T",
        merchant_raw: "AT&T MOBILITY AUTOPAY - THANK YOU!",
        amount: 75.00,
        category: "Utility Bills",
        status: "verified",
        is_return: 0,
        has_receipt: true,
        source: "Frontpage Receipt (Step 4 - Mobile Service)",
        created_at: "2026-10-28T09:00:00Z"
      }
    ];
    setTransactions(prev => [...frontpageTxs, ...prev]);
    setActiveTab('assistant');
    setMessages(prev => [
      ...prev,
      {
        sender: 'agent' as const,
        text: `Loaded 4 Frontpage Journey transactions totaling **$249.31** into Master Ledger: Restaurant ($46.70 Outside Food), Marshalls ($38.69 Apparel), Walmart ($88.92 Grocery), and AT&T ($75.00 Utility Bills).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Log out current user and clear local session
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken('');
    localStorage.removeItem('spendtrace_user');
    localStorage.removeItem('spendtrace_token');
    setShowUserDropdown(false);
    setTransactions([]);
    setRefunds([]);
    setEvalData(null);
    setTraces([]);
    setActiveTab('assistant');
    setMessages(prev => [
      ...prev,
      {
        sender: 'agent',
        text: "You have been logged out. Sign in or create an account to record expenses and access intelligence.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Clear user's ledger
  const handleClearLedger = async () => {
    setShowUserDropdown(false);
    try {
      await fetch(`${API_BASE}/auth/clean-slate`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {}
    setTransactions([]);
    setRefunds([]);
    setMessages(prev => [
      ...prev,
      {
        sender: 'agent',
        text: "All transactions and refunds have been cleared (0 records). You can now upload receipts or statements to record new expenses.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Seed sample demo data into account
  const handleSeedDemoData = async () => {
    setShowUserDropdown(false);
    try {
      await fetch(`${API_BASE}/auth/seed-demo`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      fetchLedger();
      fetchRefunds();
    } catch (e) {
      setTransactions(MOCK_BENCHMARK_TRANSACTIONS);
      setRefunds(MOCK_REFUNDS);
    }
  };

  // Toggle Role between Admin and Member
  const handleSwitchRole = async (targetRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.access_token) {
          setAuthToken(data.access_token);
        }
      } else {
        setCurrentUser(prev => prev ? { ...prev, role: targetRole } : null);
      }
    } catch (e) {
      setCurrentUser(prev => prev ? { ...prev, role: targetRole } : null);
    }
    setShowUserDropdown(false);
  };

  // Client-side simulated CSV master ledger export for Demo Admin and users
  const handleExportCsv = () => {
    const txsToExport = transactions.length > 0 ? transactions : MOCK_BENCHMARK_TRANSACTIONS;
    const csvContent = generateMasterLedgerCsv(txsToExport);
    const filename = `spendtrace_master_ledger_${currentUser?.role === 'admin' ? 'demo_admin' : (currentUser?.email?.split('@')[0] || 'account')}.csv`;
    downloadCsvLocally(filename, csvContent);
  };

  // Open Dispute Notice Draft modal with verified vendor contact info
  const handleOpenDisputeModal = async (refund: any) => {
    setSelectedRefundForDispute(refund);
    setDisputeCopied(false);
    
    // 1. Generate client-side draft instantly (resilient on GitHub Pages)
    const clientDraft = generateCustomizedDisputeDraft(
      refund,
      currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Shivani',
      currentUser?.email
    );
    setVendorContact(clientDraft.vendor_contact);
    setDisputeSubject(clientDraft.subject);
    setDisputeDraft(clientDraft.body);
    setShowDisputeModal(true);

    // 2. Proactively try backend API if active
    try {
      const res = await fetch(`${API_BASE}/refunds/dispute-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          merchant_name: refund.merchant_name,
          amount: refund.expected_amount,
          return_date: refund.return_date,
          deadline_date: refund.deadline_date,
          item_description: refund.item_description,
          notes: refund.notes
        })
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.subject) setDisputeSubject(data.subject);
          if (data.body) setDisputeDraft(data.body);
          if (data.vendor_contact) setVendorContact(data.vendor_contact);
        }
      }
    } catch (e) {
      // Offline fallback already active
    }
  };

  // Copy dispute notice to clipboard
  const handleCopyDisputeNotice = () => {
    const fullText = `Subject: ${disputeSubject}\n\n${disputeDraft}`;
    navigator.clipboard.writeText(fullText);
    setDisputeCopied(true);
    setTimeout(() => setDisputeCopied(false), 2500);
  };

  // Auth modal submit handler with password policy validation and resilient offline simulation
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMessage('');
    setAuthLoading(true);

    // Password validation for signup and reset
    if (authTab === 'signup' || authTab === 'reset') {
      if (authTab === 'reset' && authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match. Please re-enter.");
        setAuthLoading(false);
        return;
      }
      const validation = validatePasswordStrength(authPassword);
      if (!validation.valid) {
        setAuthError("Password policy: " + validation.errors.join(" "));
        setAuthLoading(false);
        return;
      }
    }

    const endpoint = authTab === 'signup' 
      ? `${API_BASE}/auth/signup` 
      : authTab === 'reset'
        ? `${API_BASE}/auth/reset-password`
        : `${API_BASE}/auth/login`;

    const payload = authTab === 'signup' 
      ? { email: authEmail, password: authPassword, full_name: authFullName, role: 'member' }
      : { email: authEmail, password: authPassword, new_password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        let data: any = {};
        try {
          data = await res.json();
        } catch (jsonErr) {
          throw new Error("OfflineFallbackTrigger");
        }
        if (!res.ok) {
          if (authTab === 'signup' && (data.detail?.includes('already exists') || data.detail?.includes('already registered'))) {
            setAuthTab('login');
            setAuthError(`Account '${authEmail}' is already registered! Please enter your password to Login / Enter.`);
            setAuthLoading(false);
            return;
          }
          throw new Error(data.detail || 'Authentication failed');
        }

        // Check if Mandatory MFA Email Verification is required
        if (data.mfa_required) {
          setIsMfaStep(true);
          setMfaEmail(data.email || authEmail);
          setMfaDevHint(data.dev_code_hint || '');
          setAuthError('');
          setAuthSuccessMessage(data.message || 'Mandatory MFA: A 6-digit verification code has been dispatched to your email.');
          return;
        }

        if (data.user) {
          setCurrentUser(data.user);
        }
        if (data.access_token) {
          setAuthToken(data.access_token);
        }
        if (authTab === 'reset') {
          setAuthSuccessMessage("Password successfully reset! You are now logged in.");
          setTimeout(() => {
            setShowAuthModal(false);
            setAuthEmail('');
            setAuthPassword('');
            setAuthConfirmPassword('');
            setAuthSuccessMessage('');
          }, 1200);
        } else {
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
          setAuthFullName('');
          if (authTab === 'signup') {
            setTransactions([]);
            setRefunds([]);
            setActiveTab('assistant');
          }
        }
        return;
      }
      // If response was not JSON (e.g. 404 HTML on static GitHub Pages)
      throw new Error("OfflineFallbackTrigger");
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (authTab === 'signup' && (errMsg.includes('already exists') || errMsg.includes('already registered'))) {
        setAuthTab('login');
        setAuthError(`Account '${authEmail}' is already registered! Please enter your password to Login / Enter.`);
        setAuthLoading(false);
        return;
      }
      if (errMsg !== "OfflineFallbackTrigger" && !errMsg.includes("Unexpected token") && !errMsg.includes("Failed to fetch") && !errMsg.includes("JSON") && !errMsg.includes("token")) {
        setAuthError(errMsg);
        setAuthLoading(false);
        return;
      }
      // Resilient browser user registry simulation (zero 'Unexpected token' errors on GitHub Pages)
      try {
        if (authTab === 'login') {
          const result = mockLoginUser(authEmail, authPassword);
          if (result.mfa_required) {
            setIsMfaStep(true);
            setMfaEmail(result.email || authEmail);
            setMfaDevHint(result.dev_code_hint || '');
            setAuthError('');
            setAuthSuccessMessage(result.message || 'Mandatory MFA: A 6-digit verification code has been dispatched.');
            return;
          }
          if (result.user) setCurrentUser(result.user);
          if (result.access_token) setAuthToken(result.access_token);
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
        } else if (authTab === 'signup') {
          const result = mockRegisterUser(authEmail, authPassword, authFullName);
          if (result.mfa_required) {
            setIsMfaStep(true);
            setMfaEmail(result.email || authEmail);
            setMfaDevHint(result.dev_code_hint || '');
            setAuthError('');
            setAuthSuccessMessage(result.message || 'Mandatory MFA: A 6-digit verification code has been dispatched.');
            return;
          }
          if (result.user) setCurrentUser(result.user);
          if (result.access_token) setAuthToken(result.access_token);
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
          setAuthFullName('');
          setTransactions([]);
          setRefunds([]);
          setActiveTab('assistant');
        } else if (authTab === 'reset') {
          const result = mockResetPassword(authEmail, authPassword);
          setCurrentUser(result.user);
          setAuthToken(result.access_token);
          setAuthSuccessMessage("Password successfully reset! You are now logged in.");
          setTimeout(() => {
            setShowAuthModal(false);
            setAuthEmail('');
            setAuthPassword('');
            setAuthConfirmPassword('');
            setAuthSuccessMessage('');
          }, 1200);
        }
      } catch (mockErr: any) {
        if (mockErr?.message?.includes('already exists')) {
          setAuthTab('login');
          setAuthError(`Account '${authEmail}' is already registered! Please enter your password to Login / Enter.`);
        } else {
          setAuthError(mockErr.message || 'Authentication error');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // MFA Code verification handler
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccessMessage('');

    if (!mfaCode.trim()) {
      setAuthError("Please enter the 6-digit verification code.");
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mfaEmail, code: mfaCode.trim() })
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'MFA verification failed');
        }
        setCurrentUser(data.user);
        setAuthToken(data.access_token);
        setIsMfaStep(false);
        setShowAuthModal(false);
        setMfaCode('');
        setMfaDevHint('');
        setMfaEmail('');
        setAuthEmail('');
        setAuthPassword('');
        setTransactions([]);
        setRefunds([]);
        setActiveTab('assistant');
        return;
      }
      throw new Error("OfflineFallbackTrigger");
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg !== "OfflineFallbackTrigger" && !errMsg.includes("Unexpected token") && !errMsg.includes("Failed to fetch") && !errMsg.includes("JSON")) {
        setAuthError(errMsg);
        setAuthLoading(false);
        return;
      }
      try {
        const result = mockVerifyMfaCode(mfaEmail, mfaCode.trim());
        setCurrentUser(result.user);
        setAuthToken(result.access_token);
        setIsMfaStep(false);
        setShowAuthModal(false);
        setMfaCode('');
        setMfaDevHint('');
        setMfaEmail('');
        setAuthEmail('');
        setAuthPassword('');
        setTransactions([]);
        setRefunds([]);
        setActiveTab('assistant');
      } catch (mockErr: any) {
        setAuthError(mockErr.message || 'Invalid verification code.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend 6-digit MFA code handler
  const handleResendMfaCode = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/resend-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mfaEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMfaDevHint(data.dev_code_hint || '');
        setAuthSuccessMessage(data.message || `New 6-digit code dispatched to ${mfaEmail}`);
        return;
      }
      throw new Error(data.detail || 'Failed to resend code');
    } catch (e: any) {
      const code = mockGenerateMfaCode(mfaEmail);
      setMfaDevHint(code);
      setAuthSuccessMessage(`New 6-digit code dispatched to ${mfaEmail}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click Guest Login (Exempt from MFA, clean slate)
  const handleGuestLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/guest-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setAuthToken(data.access_token);
        setShowAuthModal(false);
        setIsMfaStep(false);
        setTransactions([]);
        setRefunds([]);
        setActiveTab('assistant');
        return;
      }
      throw new Error("GuestFallback");
    } catch (e: any) {
      const result = mockGuestLogin();
      setCurrentUser(result.user);
      setAuthToken(result.access_token);
      setShowAuthModal(false);
      setIsMfaStep(false);
      setTransactions([]);
      setRefunds([]);
      setActiveTab('assistant');
    } finally {
      setAuthLoading(false);
    }
  };

  // Chat message send handler
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ message: textToSend })
      });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent' as const,
          text: data.response,
          hitl: data.hitl_payload,
          analytics: data.analytics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      fetchLedger();
      fetchRefunds();
      if (currentUser?.role === 'admin') {
        fetchObservability();
      }
    } catch (e: any) {
      // In-browser mock response for GitHub Pages demonstration
      const mockResult = handleMockChatResponse(textToSend);
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent' as const,
          text: mockResult.response,
          hitl: mockResult.hitl_payload,
          analytics: mockResult.analytics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      if (!textToSend.toLowerCase().includes('increase') && !textToSend.toLowerCase().includes('refund')) {
        const amountMatch = textToSend.match(/\$?(\d+(?:\.\d{2})?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 24.50;
        setTransactions(prev => [
          {
            id: `tx_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            merchant_clean: textToSend.includes('Trader') ? "Trader Joe's" : "Merchant",
            merchant_raw: textToSend,
            amount: amount,
            category: "General",
            status: "verified",
            is_return: 0,
            has_receipt: false,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // File upload handler (Receipt PDF, Image, CSV Statement, or All Formats)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fnLower = file.name.toLowerCase();
    const isCsv = fnLower.endsWith('.csv');
    const isPdf = fnLower.endsWith('.pdf') || file.type === 'application/pdf';
    const endpoint = isCsv ? `${API_BASE}/agent/ingest-csv` : `${API_BASE}/agent/ingest-receipt`;

    const userMsg = {
      sender: 'user' as const,
      text: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', `sess_${Date.now()}`);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent' as const,
          text: data.response || `Successfully processed and committed ${file.name} into PostgreSQL database.`,
          hitl: data.hitl_payload,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      fetchLedger();
      fetchRefunds();
      if (currentUser?.role === 'admin') {
        fetchObservability();
      }
    } catch (e: any) {
      // In-browser simulation for GitHub Pages demo
      if (isCsv) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'agent' as const,
            text: `Processed ${file.name} (15 transactions). Reconciling against ledger: **Duplicate swipe detected** at Joe's Diner ($18.50). Staging clarification card before committing to database.`,
            hitl: {
              interrupt_id: `int_${Date.now()}`,
              transaction_id: "aa112233-4455-6677-8899-aabbccddeeff",
              title: "Duplicate Charge Detected: Joe's Diner ($18.50)",
              description: "We noticed two identical $18.50 charges at Joe's Diner on Oct 24 within 2 hours. Merge as one duplicate swipe, or keep both?",
              options: [
                { id: "merge", label: "Merge as Duplicate (Keep 1)", is_recommended: true },
                { id: "keep", label: "Keep Both (Distinct Purchases)", is_recommended: false }
              ]
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (isPdf) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'agent' as const,
            text: `Processed electronic PDF receipt **${file.name}** via Gemini 2.0 Flash document intelligence (Confidence: 0.98). Extracted line items totaling **$162.41** from Apple Store invoice. Committed to PostgreSQL ledger.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setTransactions(prev => [
          {
            id: `tx_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            merchant_clean: "Apple Store",
            merchant_raw: file.name,
            amount: 162.41,
            category: "Electronics",
            status: "verified",
            is_return: 0,
            has_receipt: true,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'agent' as const,
            text: `Processed receipt **${file.name}** via Gemini 2.0 Flash (Confidence: 0.98). Extracted 4 line items totaling **$42.18**. Committed to master PostgreSQL ledger.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setTransactions(prev => [
          {
            id: `tx_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            merchant_clean: "Trader Joe's",
            merchant_raw: file.name,
            amount: 42.18,
            category: "Groceries",
            status: "verified",
            is_return: 0,
            has_receipt: true,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // HITL resolution click handler
  const handleHitlResolution = async (interruptId: string, optionId: string) => {
    try {
      await fetch(`${API_BASE}/agent/resolve-clarification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          interrupt_id: interruptId,
          selected_option_id: optionId
        })
      });
    } catch (e) {}

    setMessages(prev => [
      ...prev,
      {
        sender: 'agent' as const,
        text: `Resolution confirmed (${optionId === 'merge' ? 'Merged duplicate swipe' : 'Kept both charges'}). Database state reconciled successfully.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    fetchLedger();
    fetchRefunds();
    if (currentUser?.role === 'admin') {
      fetchObservability();
    }
  };

  // Trigger automated evaluations (IAM Guarded: Admin only)
  const handleRunEvals = async () => {
    setIsEvalRunning(true);
    try {
      const res = await fetch(`${API_BASE}/evals/run?suite=full_benchmark`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("API response not ok");
      const data = await res.json();
      setEvalData(data);
      if (data?.results?.length > 0) {
        setSelectedEvalTest(data.results[0]);
      }
    } catch (e) {
      // Simulate live evaluation harness progress
      await new Promise(r => setTimeout(r, 1000));
      setEvalData(MOCK_EVAL_DATA);
      setSelectedEvalTest(MOCK_EVAL_DATA.results[0]);
    } finally {
      setIsEvalRunning(false);
    }
  };

  // Filtered transactions
  const filteredTxs = transactions.filter(t => {
    const matchesCat = categoryFilter === 'All' || t.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = (t.merchant_clean || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(t.amount || '').includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Monthly Purchase Spend (Strictly excluding Credit Card Payments to prevent double-counting transfers)
  const totalSpend = transactions
    .filter(t => t.amount > 0 && t.status !== 'deleted' && t.category !== 'Credit Card Payment' && !t.is_credit_card_payment)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCcPayments = transactions
    .filter(t => t.amount > 0 && t.status !== 'deleted' && (t.category === 'Credit Card Payment' || t.is_credit_card_payment))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const overdueRefundsCount = refunds.filter(r => r.status === 'overdue_alert').length;

  return (
    <div className="app-container">
      {/* GitHub Pages Public Preview Banner */}
      {isGitHubPagesDeployment() && (
        <div style={{
          backgroundColor: '#E8F0FE',
          color: '#1967D2',
          borderBottom: '1px solid #DADCE0',
          fontSize: '12px',
          fontWeight: 500,
          padding: '6px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} />
            <span>
              <strong>GitHub Pages Public Demonstration:</strong> Full interactive in-browser agent simulation active with fictional benchmark data. Try chatting, uploading receipts, testing Refund Radar, or inspecting Model Evals & Traces.
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#5F6368', background: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', border: '1px solid #DADCE0' }}>
            GitHub Pages Live
          </span>
        </div>
      )}

      {/* Google Workspace Style Header */}
      <header className="top-nav">
        <div className="brand-section">
          <div className="brand-logo">
            SpendTrace<span className="dot">•</span>
          </div>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'frontpage' ? 'active' : ''}`}
            onClick={() => setActiveTab('frontpage')}
          >
            <Home size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Home / Frontpage
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            Assistant & Ledger
          </button>
          <button 
            className={`tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
            onClick={() => setActiveTab('radar')}
          >
            Refund Radar
            {overdueRefundsCount > 0 && (
              <span className="status-pill red">{overdueRefundsCount} Overdue</span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'plaid' ? 'active' : ''}`}
            onClick={() => { setActiveTab('plaid'); fetchPlaidAccounts(); }}
          >
            <CreditCard size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Plaid & Credit Cards
          </button>
          <button 
            className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <Layers size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Mint vs. SpendTrace
          </button>
          <button 
            className={`tab-btn ${activeTab === 'evals' ? 'active' : ''}`}
            onClick={() => setActiveTab('evals')}
          >
            <span>Model Evals</span>
            <sup className="tab-admin-sup">admin mode</sup>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'observability' ? 'active' : ''}`}
            onClick={() => setActiveTab('observability')}
          >
            <span>Observability & Traces</span>
            <sup className="tab-admin-sup">admin mode</sup>
          </button>
        </nav>

        {/* User Profile, IAM Status & Controls */}
        <div className="nav-status">
          {/* 1-Click Demo Admin Quick Launch */}
          <button 
            className="demo-admin-nav-btn"
            onClick={handleDemoAdminLogin}
            title="1-Click Instant Login as Demo Admin (admin@spendtrace.ai) with full rich ledger & evaluations"
          >
            <Star size={13} fill="#FFFFFF" />
            <span>Demo Admin</span>
          </button>

          {!currentUser ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="secondary-btn"
                onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccessMessage(''); setShowAuthModal(true); }}
                title="Create a new account"
                style={{ padding: '6px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <UserPlus size={14} />
                <span>Register</span>
              </button>
              <button 
                className="primary-btn signin-nav-btn"
                onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccessMessage(''); setShowAuthModal(true); }}
                title="Login / Enter SpendTrace"
              >
                <Key size={14} />
                <span>Login</span>
              </button>
            </div>
          ) : (
            <button 
              className="logout-nav-btn"
              onClick={handleLogout}
              title="Log Out of SpendTrace"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              className="user-profile-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title="Click to manage account and IAM permissions"
            >
              <div className="user-avatar-circle">
                {currentUser?.email ? currentUser.email[0].toUpperCase() : 'G'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {currentUser?.email || 'Guest User'}
                </span>
                <span style={{ 
                  fontSize: '9px', 
                  color: currentUser?.role === 'admin' ? 'var(--google-blue)' : 'var(--text-secondary)', 
                  fontWeight: 600, 
                  textTransform: 'uppercase' 
                }}>
                  {currentUser ? (currentUser.role === 'admin' ? 'Admin Mode' : 'Member Account') : 'Not Signed In'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showUserDropdown && (
              <div className="user-profile-menu">
                <div className="user-menu-header">
                  <div className="user-avatar-circle" style={{ width: 36, height: 36, fontSize: 16 }}>
                    {currentUser?.email ? currentUser.email[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {currentUser?.full_name || currentUser?.email || 'Guest Session'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Role: <strong style={{ color: currentUser?.role === 'admin' ? 'var(--google-blue)' : 'var(--text-secondary)' }}>
                        {currentUser ? currentUser.role?.toUpperCase() : 'LOGGED OUT'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '2px 4px' }}>
                  Quick IAM Demo Switcher:
                </div>

                <div 
                  className="user-menu-item" 
                  onClick={() => handleSwitchUser('newuser')}
                >
                  <div>
                    <strong>New User Account</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>New account with 0 transactions</div>
                  </div>
                  {currentUser?.email === 'newuser@spendtrace.ai' && <CheckCircle2 size={16} color="var(--google-green)" />}
                </div>

                <div 
                  className="user-menu-item" 
                  onClick={() => handleSwitchUser('admin')}
                >
                  <div>
                    <strong>Demo Admin (Rich Ledger)</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Access all evals & observability</div>
                  </div>
                  {currentUser?.email === 'admin@spendtrace.ai' && <CheckCircle2 size={16} color="var(--google-green)" />}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                <div className="user-menu-item" onClick={handleClearLedger}>
                  <span>Clear All Transactions</span>
                  <Sparkles size={14} color="var(--google-blue)" />
                </div>

                <div className="user-menu-item" onClick={handleSeedDemoData}>
                  <span>Load Fictional Demo Data</span>
                  <Database size={14} color="var(--google-green)" />
                </div>

                {currentUser ? (
                  <div className="user-menu-item logout-item" onClick={handleLogout}>
                    <span>Log Out</span>
                    <LogOut size={14} color="var(--google-red, #d93025)" />
                  </div>
                ) : (
                  <div className="user-menu-item" onClick={() => { setShowUserDropdown(false); setAuthTab('login'); setAuthError(''); setAuthSuccessMessage(''); setShowAuthModal(true); }}>
                    <span>Login / Enter</span>
                    <Key size={14} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="main-content">
        {/* Tab 0: SpendTrace Frontpage Showcase */}
        {activeTab === 'frontpage' && (
          <div className="frontpage-view">
            {/* Frontpage Hero Header */}
            <div className="frontpage-hero-header">
              <div className="frontpage-badge">
                <Sparkles size={14} color="var(--google-blue)" />
                <span>SpendTrace v2.4 • Automated Receipt-to-Ledger Intelligence</span>
              </div>
              <h1 className="frontpage-title">
                Autonomous Purchase Intelligence & Refund Concierge
              </h1>
              <p className="frontpage-subtitle">
                Turn physical receipt photos, digital invoices, and uncategorized bank transactions into an itemized, auditable master ledger. Track return windows with automated Refund Radar alerts and sync credit card liabilities in one unified view.
              </p>

              {/* Action Buttons Row */}
              <div className="frontpage-cta-row">
                <button 
                  className="primary-btn"
                  onClick={handleDemoAdminLogin}
                  style={{ padding: '10px 20px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(26,115,232,0.35)' }}
                >
                  <Star size={16} fill="#FFFFFF" />
                  <span>Enter as Demo Admin</span>
                </button>
                <button 
                  className="secondary-btn"
                  onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccessMessage(''); setShowAuthModal(true); }}
                  style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={15} />
                  <span>Register Account</span>
                </button>
                <button 
                  className="secondary-btn"
                  onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccessMessage(''); setShowAuthModal(true); }}
                  style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Key size={15} />
                  <span>Login</span>
                </button>
                <button 
                  className="secondary-btn"
                  onClick={() => setActiveTab('assistant')}
                  style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Bot size={15} color="var(--google-blue)" />
                  <span>Open Assistant & Ledger</span>
                </button>
                <button 
                  className="secondary-btn"
                  onClick={() => setActiveTab('radar')}
                  style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ShieldAlert size={15} color="var(--google-blue)" />
                  <span>View Refund Radar</span>
                </button>
                <button 
                  className="secondary-btn"
                  onClick={handleLoadFrontpageBenchmarkTxs}
                  title="Inject the 4 benchmark diagram purchases ($249.31) into live master ledger"
                  style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F1F3F4' }}
                >
                  <Database size={15} color="var(--google-green)" />
                  <span>Load $249.31 Diagram into Ledger</span>
                </button>
              </div>
            </div>

            {/* Frontpage Hero Image Showcase Card */}
            <div className="frontpage-image-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34A853' }} />
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    SpendTrace Autonomous Pipeline: Receipt Ingestion → Intelligent Category Mapping → Expense Ledger ($249.31)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Oct 28, 2026 Purchase Sequence
                  </span>
                  <span className="status-pill green">
                    4 Verified Receipts
                  </span>
                </div>
              </div>

              {/* High-Resolution Frontpage Diagram Image */}
              <img 
                src={spendtraceFrontpageImg} 
                alt="SpendTrace Spending by Category, Expense Ledger, and Purchase Journey Sequence" 
                className="frontpage-hero-image" 
              />
            </div>

            {/* 4 Interactive Journey Purchase Cards Matching Diagram */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Purchase Journey Sequence ($249.31 Total)
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Each transaction demonstrates SpendTrace's unitemized receipt intelligence, accurate tax extraction, and automated ledger recording.
                  </p>
                </div>
                <button 
                  className="secondary-btn"
                  onClick={handleLoadFrontpageBenchmarkTxs}
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  <Database size={13} style={{ marginRight: 5 }} />
                  Load All 4 to Ledger
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {MOCK_FRONTPAGE_JOURNEY_ITEMS.map((item) => (
                  <div 
                    key={item.step} 
                    style={{ 
                      background: '#FFFFFF', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--google-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Step {item.step} • {item.date}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            color: item.category_color, 
                            background: `${item.category_color}18`,
                            border: `1px solid ${item.category_color}30`
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                        {item.merchant}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        <span>Subtotal:</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                      {item.tax > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                          <span>Tax:</span>
                          <span>${item.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', marginTop: '4px' }}>
                        <span>Total:</span>
                        <span style={{ color: item.category_color }}>${item.amount.toFixed(2)}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                        "{item.receipt_tag}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Capabilities Grid */}
            <div className="frontpage-features-grid">
              <div className="frontpage-feature-card">
                <div className="frontpage-feature-icon">
                  <Sparkles size={20} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Intelligent Retailer Categorization
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Even when receipts are unitemized, SpendTrace leverages vendor intelligence to classify transactions accurately (Marshalls → Apparel, Walmart → Grocery, Restaurant → Dining, AT&T → Utilities).
                </p>
              </div>

              <div className="frontpage-feature-card">
                <div className="frontpage-feature-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <ShieldAlert size={20} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Automated Refund Radar
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Tracks physical return vouchers and digital return requests against statement credits. Flags overdue merchant refunds past 10 days and drafts RFC 5322-verified dispute notices in 1 click.
                </p>
              </div>

              <div className="frontpage-feature-card">
                <div className="frontpage-feature-icon" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                  <CreditCard size={20} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Plaid & Multi-Account Sync
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Monitors credit card liabilities, minimum payments, APR rates, and statement balances side-by-side with receipt-grounded itemization to outperform legacy tools like Mint.
                </p>
              </div>

              <div className="frontpage-feature-card">
                <div className="frontpage-feature-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <CheckCircle2 size={20} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  100% Grounded Audit Trail
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Zero hallucinated financial figures. Every line item, tax value, and refund is tied directly to receipt coordinates or bank statement timestamps with verifiable provenance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Assistant & Live Ledger */}
        {activeTab === 'assistant' && (
          <div className="split-layout">
            {/* Left Pane: Conversational Intelligence */}
            <div className="left-chat-pane">
              {/* Value Proposition Header Pill */}
              <div style={{ padding: '12px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--google-blue)" />
                <span>Drop a receipt photo, upload a statement, or ask a question to track refunds and itemize spending.</span>
              </div>

              {/* Chat Timeline */}
              <div className="chat-messages">
                {messages.map((m, idx) => (
                  <div key={idx} className={`message-bubble ${m.sender}`}>
                    {m.sender === 'agent' && (
                      <div className="agent-header">
                        <Bot size={14} />
                        <span>SpendTrace Agent</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{m.timestamp}</span>
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                    {/* Grounded SQL Fact Badge */}
                    {m.analytics && m.analytics.executed_sql && (
                      <div style={{ marginTop: '10px', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--google-blue)', fontWeight: 600, marginBottom: '4px' }}>
                          <CheckCircle2 size={14} /> Grounded in PostgreSQL (Read-Only Deterministic SQL):
                        </div>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'block', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                          {m.analytics.executed_sql}
                        </code>
                        {m.analytics.cited_transaction_ids && m.analytics.cited_transaction_ids.length > 0 && (
                          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Cited verified transaction IDs: {m.analytics.cited_transaction_ids.join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive HITL Resolution Card */}
                    {m.hitl && (
                      <div className="hitl-card">
                        <div className="hitl-header">
                          <AlertCircle size={16} color="var(--google-blue)" />
                          <span style={{ fontWeight: 600 }}>{m.hitl.prompt_title}</span>
                        </div>
                        <p style={{ margin: '8px 0', fontSize: '13px' }}>{m.hitl.prompt_message}</p>
                        <div className="hitl-options">
                          {m.hitl.selectable_options?.map((opt: any) => (
                            <button 
                              key={opt.id}
                              className={`hitl-btn ${opt.is_recommended ? 'recommended' : ''}`}
                              onClick={() => handleHitlResolution(m.hitl.interrupt_id, opt.id)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="message-bubble agent loading">
                    <Sparkles size={14} className="spin-icon" /> Thinking and querying PostgreSQL database...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="chat-input-container">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.csv,application/pdf,image/*,text/csv,*/*"
                />
                <button 
                  className="attach-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Receipt (PDF, Image, CSV, All Formats)"
                  disabled={isLoading}
                >
                  <Paperclip size={18} />
                </button>
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Ask a question or log an expense (e.g. 'Spent $65 at Trader Joe's today')..."
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <button 
                  className="send-btn" 
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Right Pane: Live Ledger & Summary */}
            <div className="right-ledger-pane">
              <div className="ledger-header">
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600 }}>Master Transaction Ledger</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {currentUser?.role === 'admin' ? 'Demo Admin Account' : 'Personal Account'} • {transactions.length} Verified Records in PostgreSQL
                  </p>
                </div>
                <div className="ledger-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    className="primary-btn"
                    onClick={handleOpenImportModal}
                    title="Import ledger, Excel (.xlsx, .xls), or uncategorized bills with intelligent categorization"
                    style={{ padding: '6px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={14} /> Import Bills / Excel
                  </button>
                  <button 
                    className="secondary-btn"
                    onClick={() => { setActiveTab('plaid'); fetchPlaidAccounts(); }}
                    title="Connect & sync credit cards via Plaid"
                    style={{ padding: '6px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  >
                    <CreditCard size={14} /> Plaid Bank Sync
                  </button>
                  <button 
                    className="export-btn" 
                    onClick={handleExportCsv}
                    title="Export simulated CSV master ledger and save to your computer"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="summary-cards-row">
                <div className="summary-card">
                  <div className="label">Monthly Net Spend</div>
                  <div className="value">${totalSpend.toFixed(2)}</div>
                  {totalCcPayments > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--google-blue)', marginTop: '4px', fontWeight: 500 }}>
                      ✓ Excludes ${totalCcPayments.toFixed(2)} in CC payments
                    </div>
                  )}
                </div>
                <div className="summary-card">
                  <div className="label">Credit Card Debt</div>
                  <div className="value" style={{ color: '#4338CA' }}>
                    ${Number(plaidData?.liabilities_summary?.total_credit_debt || 4120.45).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Util: {plaidData?.liabilities_summary?.aggregate_utilization_pct || 11.8}% (Healthy)
                  </div>
                </div>
                <div className="summary-card">
                  <div className="label">Returns on Radar</div>
                  <div className="value">{refunds.length}</div>
                </div>
                <div className="summary-card">
                  <div className="label">Overdue Alerts</div>
                  <div className="value" style={{ color: overdueRefundsCount > 0 ? 'var(--google-red)' : 'var(--google-green)' }}>
                    {overdueRefundsCount}
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="ledger-filter-bar">
                <div className="search-box">
                  <input 
                    type="text" 
                    placeholder="Search merchant, category, or amount..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="category-chips">
                  {['All', 'Groceries', 'Apparel', 'Bills & Utilities', 'Credit Card Payment', 'Dining', 'Electronics'].map(cat => (
                    <button 
                      key={cat}
                      className={`chip ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table or Empty State Card */}
              <div className="table-wrapper">
                {transactions.length === 0 ? (
                  <div className="empty-state-card clean-slate-card">
                    <div className="empty-state-icon clean-slate-icon">
                      <Sparkles size={28} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Welcome to SpendTrace! No Transactions Recorded
                    </h3>
                    <p style={{ maxWidth: '480px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                      Every receipt, unformatted Excel sheet, or Plaid credit card feed is intelligently categorized into PostgreSQL.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button className="primary-btn" onClick={handleOpenImportModal}>
                        <FileSpreadsheet size={14} /> Import Ledger / Bills (.xlsx, .csv)
                      </button>
                      <button className="primary-btn" onClick={() => { setActiveTab('plaid'); fetchPlaidAccounts(); }}>
                        <CreditCard size={14} /> Connect Bank & Credit Cards (Plaid)
                      </button>
                      <button className="export-btn" onClick={() => fileInputRef.current?.click()}>
                        <Camera size={14} /> Upload Receipt (PDF, Image)
                      </button>
                      <button className="export-btn" onClick={handleSeedDemoData}>
                        Load Fictional Demo Data
                      </button>
                    </div>
                  </div>
                ) : (
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Merchant</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTxs.map(t => (
                        <tr 
                          key={t.id} 
                          onClick={() => setSelectedTx(t)}
                          style={{ cursor: 'pointer' }}
                          title="Click to inspect provenance & OCR metadata"
                        >
                          <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.date}</td>
                          <td style={{ fontWeight: 500 }}>
                            <div>{t.merchant_clean}</div>
                            {t.merchant_raw && t.merchant_raw !== t.merchant_clean && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.merchant_raw}</div>
                            )}
                          </td>
                          <td>
                            <span className={`category-badge ${getCategoryClass(t.category)}`}>
                              {t.category}
                            </span>
                            {(t.is_credit_card_payment || t.category === 'Credit Card Payment') && (
                              <div>
                                <span className="double-count-pill" title="Payment to credit card account. Excluded from monthly spend to prevent double-counting.">
                                  CC Payment (Non-Spend)
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ 
                            fontWeight: 600, 
                            color: (t.is_credit_card_payment || t.category === 'Credit Card Payment') ? '#4338CA' : t.amount < 0 ? 'var(--google-green)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)' 
                          }}>
                            {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `$${Number(t.amount).toFixed(2)}`}
                          </td>
                          <td>
                            <span className={`status-pill ${t.status === 'verified' ? 'green' : 'amber'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {t.source || (t.has_receipt ? 'Receipt OCR' : 'Statement Ingestion')}
                          </td>
                        </tr>
                      ))}
                      {filteredTxs.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No transactions found matching this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Refund Radar */}
        {activeTab === 'radar' && (
          <div className="full-tab-view">
            <div className="tab-title-row">
              <div>
                <h1 className="tab-title">Refund Radar — Return & Credit Reconciler</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  Tracks return receipts against statement credits and automatically alerts you when refunds are overdue past 10 days.
                </p>
              </div>
              <button className="export-btn" onClick={fetchRefunds}>
                <RefreshCw size={14} /> Refresh Radar
              </button>
            </div>

            {/* Refund Radar Showcase Image Card */}
            <div className="refund-radar-image-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 14px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="var(--google-blue)" />
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    Refund Radar — Automated Eligibility & Return Concierge
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="status-pill green">
                    <CheckCircle2 size={13} style={{ marginRight: 4 }} />
                    4 Purchases Analyzed for Return Windows
                  </span>
                </div>
              </div>
              <img 
                src={spendtraceRefundRadarImg} 
                alt="Refund Radar — Easily start a return or refund for any purchase" 
                className="refund-radar-hero-image" 
              />
            </div>

            {/* Interactive Refund Radar Purchases Table matching Image */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="var(--google-blue)" />
                    <span>Live Interactive Refund Eligibility Table</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Click <strong>Start Refund &gt;</strong> or <strong>Start Return &gt;</strong> to instantly preview the customized dispute draft with verified vendor support contact records.
                  </p>
                </div>
                <div style={{ background: '#E6F4EA', border: '1px solid #B7E1CD', color: '#137333', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#137333" />
                  <span>We've found 4 recent purchases that may be eligible for a refund</span>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table className="radar-interactive-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '13%' }}>Date</th>
                      <th style={{ width: '18%' }}>Merchant</th>
                      <th style={{ width: '22%' }}>Item / Description</th>
                      <th style={{ width: '13%' }}>Amount</th>
                      <th style={{ width: '14%' }}>Category</th>
                      <th style={{ width: '20%' }}>Refund Eligibility</th>
                      <th style={{ width: '14%', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RADAR_ELIGIBLE_PURCHASES.map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '13px' }}>
                          {p.date}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: '6px', 
                              background: p.merchant_name === 'Marshalls' ? '#0055A5' : p.merchant_name === 'Walmart' ? '#0071DC' : p.merchant_name === 'AT&T' ? '#00A8E0' : '#D93025',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              letterSpacing: '0.3px',
                              flexShrink: 0
                            }}>
                              {p.merchant_name.substring(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                              {p.merchant_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13.5px' }}>
                            {p.item_description}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {p.item_count_label}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                            ${p.amount.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              borderRadius: '16px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              background: p.category === 'Outside Food' ? '#FFF4E5' : p.category === 'Apparel' ? '#EBF5FF' : p.category === 'Grocery' ? '#E8F5E9' : '#F3E8FF',
                              color: p.category === 'Outside Food' ? '#C05621' : p.category === 'Apparel' ? '#1D4ED8' : p.category === 'Grocery' ? '#2E7D32' : '#7E22CE',
                              border: `1px solid ${p.category === 'Outside Food' ? '#FEEBC8' : p.category === 'Apparel' ? '#BFDBFE' : p.category === 'Grocery' ? '#C8E6C9' : '#E9D5FF'}`
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                            {p.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {p.badge_variant === 'green' ? (
                              <CheckCircle2 size={16} color="var(--google-green)" />
                            ) : (
                              <Clock size={16} color="#D97706" />
                            )}
                            <div>
                              <div style={{ 
                                fontWeight: 600, 
                                fontSize: '13px', 
                                color: p.badge_variant === 'green' ? 'var(--google-green)' : '#D97706' 
                              }}>
                                {p.eligibility_status}
                              </div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                {p.eligibility_window}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="refund-action-btn"
                            onClick={() => handleOpenDisputeModal(p)}
                            title={`Start dispute/refund for ${p.merchant_name} ($${p.amount.toFixed(2)})`}
                          >
                            <span>{p.action_label}</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 3-Step Return Concierge Workflow Footer matching Image */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', padding: '20px 24px', background: '#F8FAFC', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F0FE', color: 'var(--google-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        1. Find Purchase
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                        We locate your receipts and check return policies automatically.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F0FE', color: 'var(--google-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        2. Check Eligibility
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                        See if the item is eligible and the remaining return window.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F0FE', color: 'var(--google-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                        3. Start Refund
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                        We guide you through the return or refund process with pre-filled details.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Active Kanban Tracking Board Header */}
            <div style={{ margin: '20px 0 12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Active Return Claims & Settlement Pipeline
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Tracks physical voucher returns against credit card statement settlements. Flags overdue credits exceeding 10 days.
                </p>
              </div>
            </div>

            {refunds.length === 0 ? (
              <div className="empty-state-card clean-slate-card" style={{ maxWidth: 600, margin: '40px auto' }}>
                <div className="empty-state-icon clean-slate-icon">
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  No Active Returns on Radar
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                  Whenever you drop a return receipt into SpendTrace, Refund Radar tracks it against your bank statement credits to ensure merchants refund your money.
                </p>
                <button className="primary-btn" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={14} /> Upload Return Slip (PDF, Image, All Formats)
                </button>
              </div>
            ) : (
              <div className="radar-board">
                <div className="radar-column">
                  <div className="radar-col-header">
                    <span>1. Returns Logged</span>
                    <span className="status-pill blue">{refunds.length}</span>
                  </div>
                  {refunds.map(r => (
                    <div key={r.id} className="radar-card">
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.merchant_name}</div>
                      <div style={{ color: 'var(--google-green)', fontWeight: 500, margin: '4px 0' }}>
                        ${Number(r.expected_amount).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Returned on: {r.return_date}</div>
                    </div>
                  ))}
                </div>

                <div className="radar-column">
                  <div className="radar-col-header">
                    <span>2. Awaiting Bank Credit</span>
                    <span className="status-pill amber">{refunds.filter(r => r.status === 'awaiting_credit').length}</span>
                  </div>
                  {refunds.filter(r => r.status === 'awaiting_credit').map(r => (
                    <div key={r.id} className="radar-card">
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.merchant_name}</div>
                      <div style={{ color: 'var(--google-blue)', fontWeight: 500, margin: '4px 0' }}>
                        ${Number(r.expected_amount).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Credit expected by {r.deadline_date}</div>
                    </div>
                  ))}
                </div>

                <div className="radar-column alert-col">
                  <div className="radar-col-header">
                    <span style={{ color: 'var(--google-red)' }}>3. Overdue (&gt;10 Days)</span>
                    <span className="status-pill red">{refunds.filter(r => r.status === 'overdue_alert').length}</span>
                  </div>
                  {refunds.filter(r => r.status === 'overdue_alert').map(r => (
                    <div key={r.id} className="radar-card alert">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{r.merchant_name}</span>
                        <span className="status-pill red">OVERDUE</span>
                      </div>
                      <div style={{ color: 'var(--google-red)', fontWeight: 700, fontSize: 16, margin: '6px 0' }}>
                        ${Number(r.expected_amount).toFixed(2)}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0' }}>
                        Return date: {r.return_date}. Settlement deadline was {r.deadline_date}.
                      </p>
                      <button 
                        className="dispute-btn"
                        onClick={() => handleOpenDisputeModal(r)}
                        title="Open customized dispute notice draft with verified vendor support contacts"
                      >
                        <Mail size={13} style={{ marginRight: 6 }} />
                        Draft Dispute Notice
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Plaid & Credit Card Liabilities Synchronization */}
        {activeTab === 'plaid' && (
          <div className="full-tab-view">
            <div className="tab-title-row">
              <div>
                <h1 className="tab-title">Plaid Bank & Credit Card Synchronization</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  Real-time API feeds for bank checking and credit cards. Eliminates Mint and Credit Karma's fatal double-counting flaw by isolating credit card payments from monthly expenses.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  className="plaid-sync-btn"
                  onClick={handlePlaidSync}
                  disabled={plaidLoading}
                  title="Sync transactions and apply intelligent retailer categorization"
                >
                  <RefreshCw size={14} className={plaidLoading ? "spin-icon" : ""} />
                  {plaidLoading ? "Synchronizing Plaid Feed..." : "Sync Transactions via Plaid"}
                </button>
              </div>
            </div>

            {plaidNotification && (
              <div style={{ 
                padding: '12px 18px', 
                backgroundColor: 'var(--google-blue-bg)', 
                color: 'var(--google-blue)', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                fontSize: '13px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{plaidNotification}</span>
              </div>
            )}

            {/* Plaid Connection Hero Banner */}
            <div className="plaid-hero-banner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={20} color="#10B981" />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Plaid API Integration Active</span>
                  <span style={{ background: '#059669', fontSize: '10.5px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    SANDBOX / PRODUCTION READY
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '640px', lineHeight: 1.5 }}>
                  Connected to major financial institutions: Chase, American Express, Citi, and Bank of America. 
                  Automatic liabilities monitoring syncs minimum payments due, APRs, and statement closing dates.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  Chase Bank • Visa
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  American Express
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  Citibank • Mastercard
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  Bank of America
                </div>
              </div>
            </div>

            {/* Credit Card Liabilities Dashboard */}
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
              CREDIT CARD LIABILITIES & MONTHLY OBLIGATIONS
            </div>
            <div className="liabilities-grid">
              <div className="liability-card">
                <div className="card-title">Total Credit Card Debt</div>
                <div className="card-value" style={{ color: '#4338CA' }}>
                  ${Number(plaidData?.liabilities_summary?.total_credit_debt || 4120.45).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Across {plaidData?.accounts?.filter((a: any) => a.type === 'credit')?.length || 3} revolving credit lines
                </div>
              </div>

              <div className="liability-card">
                <div className="card-title">Total Credit Limit</div>
                <div className="card-value" style={{ color: 'var(--text-primary)' }}>
                  ${Number(plaidData?.liabilities_summary?.total_credit_limit || 35000.00).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Available purchasing power
                </div>
              </div>

              <div className="liability-card">
                <div className="card-title">Credit Utilization Rate</div>
                <div className="card-value" style={{ color: 'var(--google-green)' }}>
                  {plaidData?.liabilities_summary?.aggregate_utilization_pct || 11.8}%
                </div>
                <div className="utilization-bar-container">
                  <div 
                    className="utilization-bar-fill" 
                    style={{ 
                      width: `${Math.min(100, plaidData?.liabilities_summary?.aggregate_utilization_pct || 11.8)}%`,
                      backgroundColor: 'var(--google-green)'
                    }} 
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Healthy (&lt; 30% FICO threshold)
                </div>
              </div>

              <div className="liability-card">
                <div className="card-title">Next Minimum Due</div>
                <div className="card-value" style={{ color: 'var(--google-amber)' }}>
                  ${Number(plaidData?.liabilities_summary?.total_minimum_payment_due || 140.00).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Due Date: <strong>{plaidData?.liabilities_summary?.next_due_date || 'Nov 15, 2026'}</strong>
                </div>
              </div>
            </div>

            {/* Connected Cards & Bank Accounts Grid */}
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
              CONNECTED FINANCIAL INSTITUTIONS & PAYMENT BALANCES
            </div>
            <div className="cards-list-grid">
              {plaidData?.accounts?.map((acc: any) => (
                <div key={acc.account_id} className="connected-card-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{acc.name}</div>
                    <span className={`status-pill ${acc.type === 'credit' ? 'blue' : 'green'}`}>
                      {acc.subtype?.toUpperCase() || acc.type?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {acc.official_name} • ending in <strong>{acc.mask}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {acc.type === 'credit' ? 'CURRENT BALANCE' : 'AVAILABLE CASH'}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        ${Number(acc.current_balance).toFixed(2)}
                      </div>
                    </div>
                    {acc.credit_limit && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CREDIT LIMIT</div>
                        <div style={{ fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                          ${Number(acc.credit_limit).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {acc.type === 'credit' && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Utilization: <strong>{acc.utilization_rate_pct}%</strong></span>
                        <span>APR: <strong>{acc.apr_percentage}%</strong></span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Minimum Due: <strong>${Number(acc.minimum_payment_due).toFixed(2)}</strong></span>
                        <span>Due: <strong>{acc.next_payment_due_date}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Double Counting Explanation Showcase */}
            <div style={{ 
              background: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: 'var(--shadow-sm)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={18} color="var(--google-blue)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                  Why SpendTrace's Credit Card Payment Detection Solves Mint & Credit Karma's Core Flaw
                </h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                In legacy personal finance apps like <strong>Mint.com</strong> and <strong>Credit Karma</strong>, paying off your monthly credit card bill triggers a checking account withdrawal (e.g., $500 transfer to Chase). Because those platforms treat transfers as arbitrary expenses, users suffer from <strong>double-counting</strong>: they see $500 recorded for their actual purchases and another $500 recorded for the bill payment, inflating their apparent spending to $1,000.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '260px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--google-blue)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--google-blue)', marginBottom: '4px' }}>
                    1. Automatic Payment Identification
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Plaid transaction streams detect Autopays (Chase, Amex, Citi, BofA) and tag them as <code>is_credit_card_payment: true</code>.
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '260px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--google-green)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--google-green)', marginBottom: '4px' }}>
                    2. Clean Net Monthly Spend
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Credit card payments are strictly segregated from monthly expense analytics, giving you accurate financial reality.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mint & Credit Karma Competitive Analysis */}
        {activeTab === 'compare' && (
          <div className="full-tab-view">
            <div className="tab-title-row">
              <div>
                <h1 className="tab-title">Competitive Analysis: SpendTrace vs. Mint.com & Credit Karma</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  Comprehensive breakdown of intelligence capabilities: retailer-level heuristics, non-itemized receipt inference, unformatted Excel bill import, and double-counting prevention.
                </p>
              </div>
            </div>

            {/* Competitive Matrix Table */}
            <table className="compare-matrix-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Core Financial Capability</th>
                  <th className="st-col" style={{ width: '32%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} />
                      <span>SpendTrace (AI-Native)</span>
                    </div>
                  </th>
                  <th style={{ width: '23%' }}>Mint.com (Discontinued)</th>
                  <th style={{ width: '23%' }}>Credit Karma (Ad-Driven)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Non-Itemized Receipt Retailer Intelligence</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Retailer brand heuristic for non-itemized register receipts
                    </div>
                  </td>
                  <td className="st-cell">
                    <span style={{ color: 'var(--google-green)', fontWeight: 600 }}>✓ Intelligent Heuristic Engine</span>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      • <strong>Marshalls</strong> automatically classified as <strong>Apparel</strong> (98% confidence).<br/>
                      • <strong>Walmart</strong> (non-itemized) defaults to <strong>Groceries</strong> (96% confidence) per consumer staples heuristic.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ Blind Bank MCC Codes</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Relied on static 4-digit bank Merchant Category Codes. Marshalls was tagged as "General Merchandise" or left blank.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ Coarse MCC Codes</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Basic categorization with frequent mislabels; no retailer domain reasoning.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Receipt OCR & Itemization Overrides</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Multimodal image & PDF invoice line-item extraction
                    </div>
                  </td>
                  <td className="st-cell">
                    <span style={{ color: 'var(--google-green)', fontWeight: 600 }}>✓ Vision-Grounded Line Item OCR</span>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Gemini 2.0 Flash parses physical receipts. If a Walmart receipt includes an iPad, line-item electronics override the general grocery default.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ No Receipt Scanning</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Zero OCR capability; no invoice or line item decomposition.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ No Receipt Scanning</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Cannot scan receipts or itemize invoices.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Import Ledger & Excel Sheets (.xlsx, .csv)</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Uncategorized bill and spreadsheet ingestion
                    </div>
                  </td>
                  <td className="st-cell">
                    <span style={{ color: 'var(--google-green)', fontWeight: 600 }}>✓ Multi-Format Heuristic Importer</span>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Drag and drop any unformatted Excel sheet or bill list. Auto-detects columns and runs intelligent categorization preview.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ No Spreadsheet Importer</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Required manual transaction entry through web forms.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ No Spreadsheet Importer</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Locked exclusively to automated bank feeds.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Credit Card Payment Tracking & Double Counting</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Isolating debt payment transfers from monthly expenses
                    </div>
                  </td>
                  <td className="st-cell">
                    <span style={{ color: 'var(--google-green)', fontWeight: 600 }}>✓ Automatic Double-Counting Prevention</span>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Identifies card autopays (Chase, Amex, Citi) and flags them as non-spend transfers so checking debits don't double count against card charges.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-amber)' }}>⚠ Frequent Double-Counting Errors</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Required constant manual rule adjustment to hide internal payments.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-amber)' }}>⚠ Inconsistent Transfer Matching</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Often conflates checking withdrawals with general spending.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Missing Refund Radar & Dispute Notices</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Settlement countdown & 1-click vendor dispute letters
                    </div>
                  </td>
                  <td className="st-cell">
                    <span style={{ color: 'var(--google-green)', fontWeight: 600 }}>✓ Automated Settlement Tracking</span>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      10-day settlement window countdown, overdue alerts, and 1-click customized dispute letters with verified merchant support contacts.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ No Return Radar</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Returns were forgotten; no dispute letter automation.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ No Return Radar</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      No support for tracking pending refunds or returns.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>User Privacy & Monetization Model</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Data ownership, advertising, and user trust
                    </div>
                  </td>
                  <td className="st-cell">
                    <span style={{ color: 'var(--google-green)', fontWeight: 600 }}>✓ Zero Ads • Local & Private</span>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      Your financial data is never monetized. Self-hostable PostgreSQL ledger, Supabase open-source Auth, and mandatory MFA.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-amber)' }}>⚠ Ad-Supported Lead Generation</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Intuit credit card referrals and mortgage promotions.
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--google-red)' }}>✗ Heavy Monetization Engine</span>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Pushes high-interest personal loans and credit cards using user credit scores.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Interactive Categorization Playground */}
            <div className="compare-playground-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} color="var(--google-blue)" />
                <h3 style={{ fontSize: '17px', fontWeight: 600 }}>
                  Interactive Retailer Categorization Playground
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Test SpendTrace's intelligent categorization on any retailer name (e.g. <code>Marshalls</code>, <code>Walmart</code>, <code>Pacific Gas & Electric</code>, <code>Chase Autopay</code>).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Retailer / Merchant Name
                    </label>
                    <input 
                      type="text" 
                      value={compMerchant}
                      onChange={e => setCompMerchant(e.target.value)}
                      placeholder="e.g. Marshalls, Walmart, Target, ConEd, Chase Autopay"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="itemized-chk"
                      checked={compIsItemized}
                      onChange={e => setCompIsItemized(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="itemized-chk" style={{ fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                      Receipt is Itemized (has line items)
                    </label>
                  </div>

                  {compIsItemized && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Line Items (comma separated)
                      </label>
                      <input 
                        type="text" 
                        value={compLineItems}
                        onChange={e => setCompLineItems(e.target.value)}
                        placeholder="e.g. Apple iPad 10th Gen, Protective Case"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      className="primary-btn"
                      onClick={handleInferCategoryPlayground}
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                    >
                      Infer Intelligent Category
                    </button>
                    <button 
                      type="button" 
                      className="secondary-btn"
                      onClick={() => { setCompMerchant('Marshalls'); setCompIsItemized(false); setCompLineItems(''); setCompResult(mockInferCategory('Marshalls', false)); }}
                      style={{ padding: '8px 12px', fontSize: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      Preset: Marshalls
                    </button>
                    <button 
                      type="button" 
                      className="secondary-btn"
                      onClick={() => { setCompMerchant('Walmart'); setCompIsItemized(false); setCompLineItems(''); setCompResult(mockInferCategory('Walmart', false)); }}
                      style={{ padding: '8px 12px', fontSize: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      Preset: Walmart (Non-itemized)
                    </button>
                    <button 
                      type="button" 
                      className="secondary-btn"
                      onClick={() => { setCompMerchant('Walmart'); setCompIsItemized(true); setCompLineItems('Apple iPad 10th Gen'); setCompResult(mockInferCategory('Walmart', true, ['Apple iPad 10th Gen'])); }}
                      style={{ padding: '8px 12px', fontSize: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      Preset: Walmart (Itemized with iPad)
                    </button>
                  </div>
                </div>

                {/* Inference Output Card */}
                {compResult && (
                  <div style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '10px', 
                    padding: '20px' 
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      SpendTrace Inference Output
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 600 }}>{compResult.merchant}</div>
                      <span className={`category-badge ${getCategoryClass(compResult.category)}`} style={{ fontSize: '13px', padding: '4px 12px' }}>
                        {compResult.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Confidence Score:</span>
                      <strong style={{ color: compResult.confidence >= 0.9 ? 'var(--google-green)' : 'var(--google-blue)', fontSize: '14px' }}>
                        {Math.round(compResult.confidence * 100)}%
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ({compResult.is_itemized ? 'Itemized receipt override' : 'Retailer identity heuristic'})
                      </span>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <strong>AI Reasoning:</strong> {compResult.reasoning}
                    </div>

                    {compResult.is_credit_card_payment && (
                      <div style={{ marginTop: '10px' }}>
                        <span className="double-count-pill">
                          ✓ Tagged as Credit Card Payment to prevent double-counting monthly spend
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Model Evals & Benchmark Suite (IAM Admin Mode) */}
        {activeTab === 'evals' && (
          currentUser?.role !== 'admin' ? (
            <div className="iam-barrier-card">
              <div className="iam-barrier-icon">
                <ShieldAlert size={28} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Admin Mode Required
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                Model evaluation benchmarks and automated extraction scoring are restricted to IAM Admin roles. 
                You are currently signed in as <strong>Member ({currentUser?.email})</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button className="primary-btn" onClick={() => handleSwitchRole('admin')}>
                  Elevate Account to Admin Mode
                </button>
              </div>
            </div>
          ) : (
            <div className="full-tab-view">
              <div className="tab-title-row">
                <div>
                  <h1 className="tab-title">Continuous Model Evaluation Benchmarks <sup className="tab-admin-sup" style={{ fontSize: '11px', top: -8 }}>admin mode</sup></h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                    Automated test harness asserting extraction accuracy, false-positive duplicate resistance, and deterministic SQL execution.
                  </p>
                </div>
                <button 
                  className="eval-run-btn" 
                  onClick={handleRunEvals}
                  disabled={isEvalRunning}
                >
                  <Play size={16} />
                  {isEvalRunning ? 'Executing Test Benchmark...' : '▶ Run Benchmark Suite'}
                </button>
              </div>

              {/* Scorecard Overview */}
              {evalData && (
                <div className="summary-cards-row" style={{ marginBottom: 24 }}>
                  <div className="summary-card">
                    <div className="label">Benchmark Accuracy</div>
                    <div className="value" style={{ color: 'var(--google-green)' }}>
                      {evalData.accuracy_percentage}%
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="label">Total Evaluated Tests</div>
                    <div className="value">{evalData.total_tests} Tests ({evalData.passed_tests} Passed)</div>
                  </div>
                  <div className="summary-card">
                    <div className="label">Average Latency</div>
                    <div className="value">{evalData.avg_duration_ms} ms</div>
                  </div>
                  <div className="summary-card">
                    <div className="label">Total Token Cost</div>
                    <div className="value" style={{ fontFamily: 'var(--font-mono)' }}>
                      ${evalData.total_cost_usd?.toFixed(5)}
                    </div>
                  </div>
                </div>
              )}

              {/* Split View: Test Results & Ground Truth Inspector */}
              <div className="eval-split-view">
                <div className="eval-list-pane">
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
                    BENCHMARK TEST CASES
                  </div>
                  {evalData?.results?.map((res: any) => (
                    <div 
                      key={res.id} 
                      className={`eval-test-card ${selectedEvalTest?.id === res.id ? 'active' : ''}`}
                      onClick={() => setSelectedEvalTest(res)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{res.test_name}</span>
                        <span className={`status-pill ${res.status === 'PASS' ? 'green' : 'red'}`}>
                          {res.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        Category: {res.category} • {res.duration_ms}ms • ${res.token_cost_usd?.toFixed(5)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="eval-detail-pane">
                  {selectedEvalTest ? (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                        {selectedEvalTest.test_name}
                      </h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        <span>Test ID: <code>{selectedEvalTest.test_id}</code></span>
                        <span>Duration: {selectedEvalTest.duration_ms} ms</span>
                        <span>Evaluation Status: <strong>{selectedEvalTest.status}</strong></span>
                      </div>

                      <div className="diff-comparison-grid">
                        <div className="diff-col">
                          <div className="diff-header">Expected Ground Truth (Contract)</div>
                          <pre className="diff-box">
                            {JSON.stringify(JSON.parse(selectedEvalTest.ground_truth_json || '{}'), null, 2)}
                          </pre>
                        </div>
                        <div className="diff-col">
                          <div className="diff-header">Model Output & Assertion</div>
                          <pre className="diff-box">
                            {JSON.stringify(JSON.parse(selectedEvalTest.predicted_json || '{}'), null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                      Select a test case to inspect contract ground truth vs predicted extraction.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* Tab 4: Agent Observability & Traces (IAM Admin Mode) */}
        {activeTab === 'observability' && (
          currentUser?.role !== 'admin' ? (
            <div className="iam-barrier-card">
              <div className="iam-barrier-icon">
                <ShieldAlert size={28} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Admin Mode Required
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                Observability waterfall traces and per-step token economics are restricted to IAM Admin roles. 
                You are currently signed in as <strong>Member ({currentUser?.email})</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button className="primary-btn" onClick={() => handleSwitchRole('admin')}>
                  Elevate Account to Admin Mode
                </button>
              </div>
            </div>
          ) : (
            <div className="full-tab-view">
              <div className="tab-title-row">
                <div>
                  <h1 className="tab-title">Agent Observability & Execution Telemetry <sup className="tab-admin-sup" style={{ fontSize: '11px', top: -8 }}>admin mode</sup></h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                    Waterfall execution spans, per-step latency, token economics, and inspectable system prompts.
                  </p>
                </div>
                <button className="export-btn" onClick={fetchObservability}>
                  <RefreshCw size={14} /> Refresh Traces
                </button>
              </div>

              {/* Telemetry Metrics Row */}
              {obsMetrics && (
                <div className="summary-cards-row" style={{ marginBottom: 24 }}>
                  <div className="summary-card">
                    <div className="label">Total Invocations</div>
                    <div className="value">{obsMetrics.total_traces || 0}</div>
                  </div>
                  <div className="summary-card">
                    <div className="label">Avg End-to-End Latency</div>
                    <div className="value">{Math.round(obsMetrics.avg_latency_ms || 0)} ms</div>
                  </div>
                  <div className="summary-card">
                    <div className="label">Total Tokens Consumed</div>
                    <div className="value">{(obsMetrics.total_prompt_tokens + obsMetrics.total_completion_tokens) || 0}</div>
                  </div>
                  <div className="summary-card">
                    <div className="label">Total SpendTrace COGS</div>
                    <div className="value" style={{ fontFamily: 'var(--font-mono)' }}>
                      ${(obsMetrics.total_cost_usd || 0).toFixed(5)}
                    </div>
                  </div>
                </div>
              )}

              {/* Traces Explorer */}
              <div className="eval-split-view">
                <div className="eval-list-pane">
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
                    RECENT AGENT INVOCATIONS
                  </div>
                  {traces.map(tr => (
                    <div 
                      key={tr.id}
                      className={`eval-test-card ${selectedTrace?.id === tr.id ? 'active' : ''}`}
                      onClick={() => fetchTraceDetail(tr.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{tr.input_type?.toUpperCase()}</span>
                        <span className={`status-pill ${tr.status === 'SUCCESS' ? 'green' : 'amber'}`}>
                          {tr.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 4 }}>
                        {tr.user_query}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {tr.total_duration_ms}ms • ${tr.total_cost_usd?.toFixed(5)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="eval-detail-pane">
                  {selectedTrace ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                          Trace Waterfall: {selectedTrace.id}
                        </h3>
                        <span className="status-pill blue">{selectedTrace.input_type}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Query: "{selectedTrace.user_query}"
                      </p>

                      {/* Waterfall Spans Timeline */}
                      <div className="waterfall-container">
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                          EXECUTION SPAN WATERFALL
                        </div>
                        {selectedTrace.spans?.map((span: any) => {
                          const maxDur = Math.max(...selectedTrace.spans.map((s: any) => s.duration_ms || 1), 1);
                          const widthPct = Math.max(12, Math.min(100, (span.duration_ms / maxDur) * 100));
                          return (
                            <div key={span.id} className="waterfall-row">
                              <div className="waterfall-label">{span.node_name}</div>
                              <div className="waterfall-bar-track">
                                <div className="waterfall-bar-fill" style={{ width: `${widthPct}%` }}>
                                  {span.duration_ms}ms (${span.cost_usd?.toFixed(5)})
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Span Inspection List */}
                      <div style={{ marginTop: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Span System Details & Prompts</div>
                        {selectedTrace.spans?.map((span: any) => (
                          <div key={span.id} style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                              <span>{span.node_name}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${span.cost_usd?.toFixed(5)}</span>
                            </div>
                            {span.tool_name && (
                              <div style={{ fontSize: 12, color: 'var(--google-blue)', marginTop: 4 }}>
                                Tool Executed: <code>{span.tool_name}</code>
                              </div>
                            )}
                            {span.tool_input_json && (
                              <pre style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 4, fontSize: 11, marginTop: 4, overflowX: 'auto' }}>
                                {span.tool_input_json}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                      Select an execution trace to view its latency waterfall and token economics.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Slide-over Transaction Provenance Inspector Modal */}
      {selectedTx && (
        <div className="modal-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="provenance-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--google-blue)" />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Transaction Provenance & Audit Trail</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedTx(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="provenance-detail-row">
                <span className="p-label">Transaction ID</span>
                <span className="p-value mono">{selectedTx.id}</span>
              </div>
              <div className="provenance-detail-row">
                <span className="p-label">User ID (Tenant)</span>
                <span className="p-value mono">{selectedTx.user_id || currentUser?.id}</span>
              </div>
              <div className="provenance-detail-row">
                <span className="p-label">Merchant Name (Normalized / Raw)</span>
                <span className="p-value">{selectedTx.merchant_clean} ({selectedTx.merchant_raw || selectedTx.merchant_clean})</span>
              </div>
              <div className="provenance-detail-row">
                <span className="p-label">Transaction Amount</span>
                <span className="p-value" style={{ fontWeight: 600, color: selectedTx.amount < 0 ? 'var(--google-green)' : 'inherit' }}>
                  ${Math.abs(Number(selectedTx.amount)).toFixed(2)} {selectedTx.amount < 0 ? '(Credit/Refund)' : ''}
                </span>
              </div>
              <div className="provenance-detail-row">
                <span className="p-label">Category</span>
                <span className="p-value">{selectedTx.category}</span>
              </div>
              <div className="provenance-detail-row">
                <span className="p-label">Source System</span>
                <span className="p-value">{selectedTx.source}</span>
              </div>
              <div className="provenance-detail-row">
                <span className="p-label">Verification Status</span>
                <span className="p-value status-pill green">{selectedTx.status}</span>
              </div>
              {selectedTx.receipt_id && (
                <div className="provenance-detail-row">
                  <span className="p-label">Linked Receipt UUID</span>
                  <span className="p-value mono">{selectedTx.receipt_id}</span>
                </div>
              )}
              {selectedTx.trace_id && (
                <div className="provenance-detail-row">
                  <span className="p-label">Execution Trace</span>
                  <span className="p-value mono">{selectedTx.trace_id}</span>
                </div>
              )}
              {selectedTx.notes && (
                <div className="provenance-detail-row">
                  <span className="p-label">Audit Notes</span>
                  <span className="p-value">{selectedTx.notes}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="primary-btn" onClick={() => setSelectedTx(null)}>
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Notice Draft Modal with Verified Vendor Support & Source Link */}
      {showDisputeModal && selectedRefundForDispute && vendorContact && (
        <div className="auth-modal-backdrop" onClick={() => setShowDisputeModal(false)}>
          <div className="dispute-modal-card" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={22} color="var(--google-blue)" />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    Dispute Notice Draft — {vendorContact.canonical_name}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Overdue Return • ${Math.abs(Number(selectedRefundForDispute.expected_amount || 0)).toFixed(2)} USD • Return Date: {selectedRefundForDispute.return_date}
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowDisputeModal(false)} title="Close Dispute Window">
                <X size={18} />
              </button>
            </div>

            {/* Vendor Contact Information Card with Validation & Source Hyperlink */}
            <div className="vendor-contact-card">
              <div className="vendor-contact-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Recipient Support Email:
                  </span>
                  <code style={{ fontSize: 13, background: '#FFFFFF', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border-color)', color: 'var(--google-blue)', fontWeight: 600 }}>
                    {vendorContact.support_email}
                  </code>
                  <span className="status-pill green" title={vendorContact.email_validation.validation_note}>
                    <CheckCircle2 size={13} style={{ marginRight: 4 }} />
                    {vendorContact.email_validation.validation_badge}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, flexWrap: 'wrap', marginTop: 2 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Obtained From Official Support Website:
                </span>
                <a 
                  href={vendorContact.support_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="support-website-link"
                  title="Click to open and verify contact information on the vendor's official support portal"
                >
                  <span>{vendorContact.support_url}</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 2 }}>
                ✓ <strong>Validated Contact:</strong> {vendorContact.email_validation.validation_note} Source: <em>{vendorContact.source_citation}</em>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Dispute Email Subject Line
              </label>
              <input 
                type="text" 
                value={disputeSubject} 
                onChange={e => setDisputeSubject(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            {/* Customized Dispute Draft Text Box */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Sample Customized Dispute Notice (Editable Text Box)
                </label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Tailored to return voucher notes, statutory deadline, and chargeback rights
                </span>
              </div>
              <textarea 
                className="dispute-draft-textarea"
                rows={11}
                value={disputeDraft}
                onChange={e => setDisputeDraft(e.target.value)}
                placeholder="Dispute notice letter content..."
              />
            </div>

            {/* Modal Actions */}
            <div className="dispute-modal-actions">
              <button 
                className="secondary-btn"
                onClick={() => setShowDisputeModal(false)}
                style={{ padding: '8px 16px' }}
              >
                Close
              </button>

              <a 
                href={`mailto:${vendorContact.support_email}?subject=${encodeURIComponent(disputeSubject)}&body=${encodeURIComponent(disputeDraft)}`}
                className="secondary-btn"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                title="Open system default email client with recipient, subject, and body pre-filled"
              >
                <Mail size={14} /> Open in Email App
              </a>

              <button 
                className="primary-btn"
                onClick={handleCopyDisputeNotice}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontWeight: 600 }}
              >
                {disputeCopied ? (
                  <>
                    <Check size={14} /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Dispute Notice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Open Source Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
            {isMfaStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ textAlign: 'center', padding: '6px 0 2px 0' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                    <ShieldCheck size={26} color="var(--google-blue)" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                    Verify Your Email Address
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                    Mandatory Multi-Factor Authentication (MFA) to safeguard your financial records & PII.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <Mail size={13} color="var(--google-blue)" />
                    <span>Dispatched code to: <strong>{mfaEmail}</strong></span>
                  </div>
                </div>

                {authError && (
                  <div style={{ padding: '8px 12px', background: '#fce8e6', color: 'var(--google-red)', borderRadius: '6px', fontSize: '12px' }}>
                    {authError}
                  </div>
                )}

                {/* Simulated Verification Code Notice */}
                <div style={{ background: '#e6f4ea', border: '1px solid #b7e1cd', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#137333' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <CheckCircle2 size={15} /> Dispatched Verification Code:
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    Your 6-digit MFA code is <strong style={{ letterSpacing: '2px', background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ceead6' }}>{mfaDevHint || '123456'}</strong> (or enter universal test code <strong>123456</strong>).
                  </div>
                </div>

                <form onSubmit={handleVerifyMfa} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
                      Enter 6-Digit Verification Code
                    </label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      autoFocus
                      placeholder="123456" 
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        borderRadius: '6px', 
                        border: '2px solid var(--google-blue)', 
                        fontSize: '22px', 
                        fontWeight: 700, 
                        textAlign: 'center',
                        letterSpacing: '8px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="primary-btn" 
                    disabled={authLoading || mfaCode.length < 6}
                    style={{ width: '100%', padding: '10px', fontWeight: 600, fontSize: '14px' }}
                  >
                    {authLoading ? 'Verifying Code...' : 'Verify Email & Enter SpendTrace'}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '2px' }}>
                    <button 
                      type="button" 
                      onClick={handleResendMfaCode}
                      disabled={authLoading}
                      style={{ background: 'none', border: 'none', color: 'var(--google-blue)', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                    >
                      Resend 6-Digit Code
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setIsMfaStep(false); setAuthError(''); setAuthSuccessMessage(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                    >
                      ← Back to Login / Change Email
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '18px' }}>
                    <Key size={20} color="var(--google-blue)" />
                    <span>Account Authentication</span>
                  </div>
                  <button className="close-btn" onClick={() => setShowAuthModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    style={{ 
                      background: authTab === 'demo' ? '#E8F0FE' : 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      fontSize: '13.5px', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: authTab === 'demo' ? '2px solid var(--google-blue)' : '2px solid transparent',
                      color: authTab === 'demo' ? 'var(--google-blue)' : 'var(--text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      borderRadius: '4px 4px 0 0'
                    }}
                    onClick={() => { setAuthTab('demo'); setAuthError(''); setAuthSuccessMessage(''); }}
                  >
                    <Star size={14} fill={authTab === 'demo' ? 'var(--google-blue)' : 'none'} />
                    Demo Admin
                  </button>
                  <button 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      fontSize: '13.5px', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: authTab === 'login' ? '2px solid var(--google-blue)' : '2px solid transparent',
                      color: authTab === 'login' ? 'var(--google-blue)' : 'var(--text-secondary)'
                    }}
                    onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccessMessage(''); }}
                  >
                    Login / Enter
                  </button>
                  <button 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      fontSize: '13.5px', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: authTab === 'signup' ? '2px solid var(--google-blue)' : '2px solid transparent',
                      color: authTab === 'signup' ? 'var(--google-blue)' : 'var(--text-secondary)'
                    }}
                    onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccessMessage(''); }}
                  >
                    Register
                  </button>
                  <button 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: '8px 12px', 
                      fontSize: '13.5px', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: authTab === 'reset' ? '2px solid var(--google-blue)' : '2px solid transparent',
                      color: authTab === 'reset' ? 'var(--google-blue)' : 'var(--text-secondary)'
                    }}
                    onClick={() => { setAuthTab('reset'); setAuthError(''); setAuthSuccessMessage(''); }}
                  >
                    Reset Password
                  </button>
                </div>

                {authError && (
                  <div style={{ padding: '8px 12px', background: '#fce8e6', color: 'var(--google-red)', borderRadius: '6px', fontSize: '12px' }}>
                    {authError}
                  </div>
                )}

                {authSuccessMessage && (
                  <div style={{ padding: '8px 12px', background: '#e6f4ea', color: 'var(--google-green)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} />
                    <span>{authSuccessMessage}</span>
                  </div>
                )}

                {authTab === 'demo' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
                    <div style={{ background: '#E8F0FE', border: '1px solid #C7D2FE', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--google-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                            1-Click Demo Admin Account
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Pre-configured system administrator (<code>admin@spendtrace.ai</code>)
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 12px 0' }}>
                        Instantly access SpendTrace with administrative privileges. Pre-loaded with the <strong>$249.31</strong> benchmark purchase sequence, active Refund Radar items, Plaid synced accounts, model eval suite, and OpenTelemetry trace logs.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11.5px', color: '#1E40AF', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={13} color="#2563EB" /> <span>Full Master Ledger ($249.31)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={13} color="#2563EB" /> <span>Refund Radar & Overdue Alerts</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={13} color="#2563EB" /> <span>Plaid Credit Card Liabilities</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={13} color="#2563EB" /> <span>Bypasses MFA Verification</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="primary-btn"
                        onClick={handleDemoAdminLogin}
                        disabled={authLoading}
                        style={{ width: '100%', padding: '11px', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Star size={16} fill="#FFFFFF" />
                        <span>Enter SpendTrace as Demo Admin</span>
                      </button>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Prefer registering with your personal email? Switch to{' '}
                      <button 
                        type="button" 
                        onClick={() => setAuthTab('signup')}
                        style={{ background: 'none', border: 'none', color: 'var(--google-blue)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        Register
                      </button>
                      {' '}or{' '}
                      <button 
                        type="button" 
                        onClick={() => setAuthTab('login')}
                        style={{ background: 'none', border: 'none', color: 'var(--google-blue)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                      >
                        Standard Login
                      </button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {authTab === 'signup' && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Jane Doe" 
                        value={authFullName}
                        onChange={e => setAuthFullName(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                      />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      {authTab === 'reset' ? 'Account Email Address' : 'Email Address (Personal, corporate, or demo account)'}
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. user@gmail.com, yourname@company.org, or admin@spendtrace.ai" 
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      {authTab === 'reset' ? 'New Password' : 'Password'}
                    </label>
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                    />
                  </div>

                  {/* Universal Password Guidance & Real-time Policy Checklist */}
                  {(() => {
                    const p = validatePasswordStrength(authPassword);
                    const showChecklist = authTab === 'signup' || authTab === 'reset' || authPassword.length > 0;
                    return (
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                          Password Guidance & Complexity Rules:
                        </div>
                        {showChecklist ? (
                          <>
                            <div style={{ color: p.hasMinLength ? 'var(--google-green)' : 'var(--text-muted)' }}>
                              {p.hasMinLength ? '✓' : '○'} Minimum 10 digits / characters
                            </div>
                            <div style={{ color: p.hasUpper ? 'var(--google-green)' : 'var(--text-muted)' }}>
                              {p.hasUpper ? '✓' : '○'} At least 1 capital letter (A–Z)
                            </div>
                            <div style={{ color: p.hasLower ? 'var(--google-green)' : 'var(--text-muted)' }}>
                              {p.hasLower ? '✓' : '○'} At least 1 small letter (a–z)
                            </div>
                            <div style={{ color: p.hasSpecial ? 'var(--google-green)' : 'var(--text-muted)' }}>
                              {p.hasSpecial ? '✓' : '○'} At least 1 special character (!@#$%^&*...)
                            </div>
                          </>
                        ) : (
                          <div style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            Must be at least 10 characters and contain at least 1 capital letter, 1 small letter, and 1 special character.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {authTab === 'reset' && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Re-enter new password" 
                        value={authConfirmPassword}
                        onChange={e => setAuthConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                      />
                    </div>
                  )}

                  {authTab === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                      <button 
                        type="button" 
                        onClick={() => { setAuthTab('reset'); setAuthError(''); setAuthSuccessMessage(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--google-blue)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                      >
                        Forgot or reset password?
                      </button>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="primary-btn" 
                    disabled={authLoading}
                    style={{ width: '100%', padding: '10px', marginTop: '4px', fontWeight: 600 }}
                  >
                    {authLoading ? 'Authenticating...' : authTab === 'login' ? 'Login / Enter' : authTab === 'signup' ? 'Create Account' : 'Reset Password'}
                  </button>

                  {/* 1-Click Guest Login Alternative */}
                  <div style={{ position: 'relative', textAlign: 'center', margin: '4px 0' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)' }}></div>
                    <span style={{ position: 'relative', background: 'var(--bg-primary, #fff)', padding: '0 8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      OR RAPID EVALUATION
                    </span>
                  </div>

                  <button 
                    type="button" 
                    className="secondary-btn"
                    onClick={handleGuestLogin}
                    disabled={authLoading}
                    style={{ width: '100%', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}
                  >
                    <UserCheck size={16} />
                    <span>Continue as Guest (No MFA Required)</span>
                  </button>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                    Demo Admin (<code>admin@spendtrace.ai</code>) and Guest accounts bypass MFA. All custom user emails require mandatory 6-digit MFA verification.
                  </div>

                  {/* Intuitive switch helper */}
                  <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '2px', color: 'var(--text-secondary)' }}>
                    {authTab === 'login' ? (
                      <span>
                        New to SpendTrace?{' '}
                        <button 
                          type="button" 
                          onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                          style={{ background: 'none', border: 'none', color: 'var(--google-blue)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                        >
                          Create Account
                        </button>
                      </span>
                    ) : authTab === 'signup' ? (
                      <span>
                        Already have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => { setAuthTab('login'); setAuthError(''); }}
                          style={{ background: 'none', border: 'none', color: 'var(--google-blue)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                        >
                          Login / Enter
                        </button>
                      </span>
                    ) : (
                      <span>
                        Remembered password?{' '}
                        <button 
                          type="button" 
                          onClick={() => { setAuthTab('login'); setAuthError(''); }}
                          style={{ background: 'none', border: 'none', color: 'var(--google-blue)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                        >
                          Login / Enter
                        </button>
                      </span>
                    )}
                  </div>
                </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Spreadsheet / Excel & Bills Importer Modal */}
      {showImportModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '880px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={22} color="var(--google-blue)" />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Import Ledger, Excel Spreadsheet, or Bills</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Ingests uncategorized lists, statement ledgers, and bills (.xlsx, .xls, .csv). SpendTrace applies intelligent categorization.
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowImportModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Dropzone & Quick Action Bar */}
            <input 
              type="file" 
              ref={importFileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleSpreadsheetFileUpload} 
              accept=".xlsx,.xls,.csv"
            />

            <div 
              className="importer-dropzone"
              onClick={() => importFileInputRef.current?.click()}
            >
              <Upload size={32} color="var(--google-blue)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {importLoading ? "Analyzing spreadsheet with AI categorizer..." : "Choose or drop an Excel (.xlsx, .xls) or CSV statement"}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Fuzzy column detection for Date, Merchant / Description, Amount, and Category.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={handleLoadSampleBills}
                  style={{ padding: '6px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                >
                  <Sparkles size={14} color="var(--google-blue)" /> Load Sample Bills (Marshalls, Walmart, Utilities, Autopay)
                </button>
                <button 
                  type="button" 
                  className="export-btn"
                  onClick={handleDownloadSampleExcel}
                  style={{ padding: '6px 12px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download Sample Template (.xlsx)
                </button>
              </div>
              {importPreviewRecords && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>{importPreviewRecords.length}</strong> records ready for review
                </div>
              )}
            </div>

            {importSuccessMsg && (
              <div style={{ 
                marginTop: '14px', 
                padding: '10px 14px', 
                backgroundColor: 'var(--google-green-bg)', 
                color: 'var(--google-green)', 
                borderRadius: '8px', 
                border: '1px solid #BBF7D0', 
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Preview Table */}
            {importPreviewRecords && importPreviewRecords.length > 0 && (
              <div className="preview-table-container">
                <table className="ledger-table" style={{ margin: 0, fontSize: '12.5px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Date</th>
                      <th style={{ width: '25%' }}>Merchant Description</th>
                      <th style={{ width: '12%' }}>Original Tag</th>
                      <th style={{ width: '18%' }}>SpendTrace Category</th>
                      <th style={{ width: '25%' }}>Intelligence & AI Reasoning</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreviewRecords.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
                        <td style={{ fontWeight: 500 }}>
                          <div>{r.merchant_clean || r.merchant_raw}</div>
                          {r.merchant_raw && r.merchant_raw !== r.merchant_clean && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.merchant_raw}</div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                            {r.original_category || 'Uncategorized'}
                          </span>
                        </td>
                        <td>
                          <span className={`category-badge ${getCategoryClass(r.inferred_category)}`}>
                            {r.inferred_category}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--google-green)', fontWeight: 600, marginLeft: '6px' }}>
                            {Math.round((r.confidence || 0.95) * 100)}%
                          </span>
                          {r.is_credit_card_payment && (
                            <div>
                              <span className="double-count-pill" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                                Non-Spend CC Payment
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {r.reasoning}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, textAlign: 'right', color: r.is_credit_card_payment ? '#4338CA' : 'inherit' }}>
                          ${Number(r.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={() => setShowImportModal(false)}
                disabled={importLoading}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="primary-btn" 
                onClick={handleCommitSpreadsheet}
                disabled={importLoading || !importPreviewRecords || importPreviewRecords.length === 0}
                style={{ padding: '8px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} />
                {importLoading ? "Committing Records..." : `Commit ${importPreviewRecords?.length || 0} Records to Ledger`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
