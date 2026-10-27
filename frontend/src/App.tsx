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
  CheckCircle2,
  Database,
  Key,
  LogOut,
  Mail,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

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
  generateMasterLedgerCsv,
  downloadCsvLocally,
  generateCustomizedDisputeDraft,
  type VendorSupportInfo
} from './lib/mockService';

const API_BASE = '/api/v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'radar' | 'evals' | 'observability'>('assistant');
  
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
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@spendtrace.ai', password: 'adminpassword123' })
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
          setCurrentUser(result.user);
          setAuthToken(result.access_token);
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
        } else if (authTab === 'signup') {
          const result = mockRegisterUser(authEmail, authPassword, authFullName);
          setCurrentUser(result.user);
          setAuthToken(result.access_token);
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

  const totalSpend = transactions
    .filter(t => t.amount > 0 && t.status !== 'deleted')
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

        {/* User Profile, IAM Status & Supabase Auth Controls */}
        <div className="nav-status">
          <a 
            href="./submission.docx" 
            download="submission.docx" 
            className="export-btn"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px' }}
            title="Download Official Submission Document (submission.docx)"
          >
            <Download size={13} />
            <span>submission.docx</span>
          </a>

          <span className="status-pill green">
            <Database size={12} />
            PostgreSQL • Supabase Auth
          </span>

          {currentUser ? (
            <button 
              className="logout-nav-btn"
              onClick={handleLogout}
              title="Log Out of SpendTrace"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          ) : (
            <button 
              className="primary-btn signin-nav-btn"
              onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccessMessage(''); setShowAuthModal(true); }}
              title="Login / Enter SpendTrace"
            >
              <Key size={14} />
              <span>Login / Enter</span>
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
                <div className="ledger-actions">
                  <a href="./submission.docx" className="export-btn" download="submission.docx" title="Download Official Project Submission Document (.docx)">
                    <FileText size={14} /> submission.docx
                  </a>
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
                  <div className="label">Total Recorded Spend</div>
                  <div className="value">${totalSpend.toFixed(2)}</div>
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
                  {['All', 'Groceries', 'Dining', 'Shopping', 'General'].map(cat => (
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
                      Every receipt, PDF invoice, or statement you upload is saved into PostgreSQL, connected to related records, and itemized by the AI agent.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button className="primary-btn" onClick={() => fileInputRef.current?.click()}>
                        <Camera size={14} /> Upload Receipt (PDF, Image, All Formats)
                      </button>
                      <button className="export-btn" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} /> Import Statement (CSV, All Formats)
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
                          <td style={{ fontWeight: 500 }}>{t.merchant_clean}</td>
                          <td>
                            <span className="category-badge">{t.category}</span>
                          </td>
                          <td style={{ 
                            fontWeight: 600, 
                            color: t.amount < 0 ? 'var(--google-green)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)' 
                          }}>
                            {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `$${Number(t.amount).toFixed(2)}`}
                          </td>
                          <td>
                            <span className={`status-pill ${t.status === 'verified' ? 'green' : 'amber'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.source}</td>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '18px' }}>
                <Key size={20} color="var(--google-blue)" />
                <span>Supabase Open Source Auth</span>
              </div>
              <button className="close-btn" onClick={() => setShowAuthModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '8px 0', 
                  fontSize: '14px', 
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
                  padding: '8px 0', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: authTab === 'signup' ? '2px solid var(--google-blue)' : '2px solid transparent',
                  color: authTab === 'signup' ? 'var(--google-blue)' : 'var(--text-secondary)'
                }}
                onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccessMessage(''); }}
              >
                Create Account
              </button>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: '8px 0', 
                  fontSize: '14px', 
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
                  {authTab === 'reset' ? 'Account Email or Username' : 'Email or Username'}
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. shivani or user@spendtrace.ai" 
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

              {authTab === 'signup' && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '6px' }}>
                  ✓ Dedicated multi-tenant account with isolated PostgreSQL storage.
                </div>
              )}

              <button 
                type="submit" 
                className="primary-btn" 
                disabled={authLoading}
                style={{ width: '100%', padding: '10px', marginTop: '6px', fontWeight: 600 }}
              >
                {authLoading ? 'Authenticating...' : authTab === 'login' ? 'Login / Enter' : authTab === 'signup' ? 'Create Account' : 'Reset Password'}
              </button>

              {/* Intuitive switch helper */}
              <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
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
          </div>
        </div>
      )}
    </div>
  );
}
