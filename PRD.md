# Product Requirements Document (PRD)
## SpendTrace — AI Expense & Purchase Intelligence Agent

**Document Version:** 1.3.0  
**Status:** Approved for Implementation & Submission  
**Target Release:** Week 3 Certification Build  
**Owner:** Product & AI Systems Engineering  

> **Note on Course Alignment:** Assignment-specific alignment remains unverified because the Week 3 handout was unreadable.

---

## 1. Executive Summary & Vision

### 1.1 Executive Overview
**SpendTrace** is a standalone, web-based application that helps individuals and households record expenses, organize purchase information, and understand spending through natural-language interaction. Users can describe an expense in a message, upload receipts, and import supported historical transaction or order files. The application converts these inputs into structured records stored in a persistent database.

The project addresses the fragmentation of purchase information across receipts, emails, merchant accounts, and financial statements. Its AI agent connects related records, identifies potential duplicates, reconciles refunds, and asks users to clarify uncertain information. Planned extensions include receipt forwarding, authorized email access, and selected merchant integrations.

Users can ask questions such as *“Why did my spending increase this month?”* or *“Which returns have no matching refund?”* The application calculates results through database queries and provides explanations linked to supporting records. Users can review, correct, export, and delete their information.

The initial prototype includes conversational expense entry, receipt uploads, historical CSV imports, spending visualizations, and source-linked analysis. A public demonstration using fictional data allows visitors to experience expense capture, reconciliation, and historical analysis without sharing personal financial information.

Success is evaluated through extraction accuracy, duplicate detection, refund matching, numerical correctness, and user feedback. The project demonstrates an end-to-end AI product combining a hosted interface, persistent storage, agent tool use, and measurable evaluation.

### 1.2 Simple Value Proposition
> **"Never lose money to forgotten returns or mystery charges again."**

**In one sentence:** SpendTrace is an autonomous AI purchase intelligence agent that converts crumpled receipts and cryptic bank lines into an itemized relational ledger, catches duplicate swipes, tracks returns until refunds post to your account, and answers spending questions with provable database citations.

* **Active vs. Passive Budgeting:** Traditional apps (Mint, Rocket Money, YNAB) are passive aggregators that only show vague bank descriptions (e.g., `SQ *ROASTER SAN FRAN CA $18.25`) with zero receipt context or refund matching. SpendTrace is an active reconciler bridging the gap between what you bought (line items) and what you were charged (bank records).
* **The "Refund Radar" Advantage:** Millions of dollars in retail and online returns are lost annually when merchants fail to settle credits. SpendTrace tracks return receipts and alerts users when refunds are overdue past 10 business days.
* **Deterministic Financial Math & Factual Grounding:** The LLM parses text and images, but 100% of arithmetic, sums, and variances are calculated by sandboxed database aggregate queries (`SUM()`, `AVG()`), with every answer grounded in verified database IDs.
* **Dual Experience (Public Demo vs. Clean Slate):** Visitors can explore a public demonstration with pre-seeded fictional data, while any new user account starts completely clean (0 transactions, 0 receipts) with multi-tenant data isolation.

### 1.3 Core Vision
To eliminate manual data entry and financial blind spots by providing an autonomous, privacy-conscious agent that guarantees 100% data provenance: **every insight, total, and anomaly is mathematically provable and directly traceable to ground-truth receipts, statement records, and verified agent reasoning spans.**

---

## 2. Problem Statement & User Personas

### 2.1 The Problem
1. **Purchase Fragmentation:** Modern consumer spending is scattered across multiple physical receipts, e-commerce order histories (Amazon, Target), delivery platforms (DoorDash, Uber Eats), and multiple credit/debit card accounts.
2. **Missing & Orphaned Refunds:** Consumers routinely return purchases (especially online apparel and retail) but rarely verify that the refund actually posted to their credit card statement 5–14 days later. Millions of dollars in returns are silently lost each year due to merchant settlement failures or untracked store credits.
3. **Receipt Disconnect from Statements:** Credit card statements show cryptic merchant codes without itemized context. Receipts contain itemized prices but are easily misplaced.
4. **Duplicate Charges:** Accidental double swipes or offline restaurant card errors often go unnoticed on lengthy monthly PDF statements.
5. **Rigid Budgeting vs. Natural Curiosity:** Users do not want to fill out 20 budget categories every month; they want answers to specific contextual questions like: *"Why did my credit card balance $600 higher than normal this month?"* or *"How much did I spend on pet supplies across all stores last quarter?"*
6. **Black-Box AI Distrust:** Financial users refuse to trust AI outputs if they cannot inspect the prompt context, intermediate agent steps, SQL queries, or confidence scores that generated the answer.

### 2.2 Target Personas

| Persona | Description | Primary Pain Point | SpendTrace Solution |
| :--- | :--- | :--- | :--- |
| **1. The Frequent E-Commerce Shopper (Jordan, 28)** *(Primary Core)* | 22–38 yr old buying apparel and electronics online (Amazon, Zara, Nordstrom) with frequent mail returns. | Forgets to check if the $89 refund credited back to their card 10 days later, leaking hundreds of dollars annually. | **Refund Radar:** Tracks return slips and sends proactive alerts on overdue refunds with 1-click merchant inquiry drafts. |
| **2. The Busy Household Manager (Alex, 34)** | Manages family spending across 3 cards and checking; shops at Costco, Target, and grocery stores. | Pockets full of fading paper receipts; hates updating spreadsheets; blindsided by high end-of-month statements. | **Snap & Drop Ingestion:** Multimodal vision itemizes purchases and pairs receipts with bank statement lines. |
| **3. The Solopreneur / Freelancer (Sam, 41)** | 1099 contractor mixing business meals and software subscriptions with personal accounts. | Spending 10+ hours hunting for receipts and tax-deductible expense proof at year-end. | **Itemized Provenance:** 100% audit trail linking every transaction to original receipt files with 1-click CSV export. |
| **4. The AI Engineer / System Auditor (Maya, 30)** | Evaluates financial agent workflows, validates precision, and monitors token costs and failure rates. | Lacks visibility into agentic trajectories, prompt drift, model hallucinations, and tool failures. | **Evals & Observability Tabs:** Live benchmark runner, ground-truth diff viewer, waterfall execution spans, and cost tracking. |

### 2.3 A Week in the Life: How Target Users Use SpendTrace

```
[ Step 1: Snap or Type ] ──► [ Step 2: Agent Reconciles ] ──► [ Step 3: 1-Click Clarification ] ──► [ Step 4: Refund Alert & Insights ]
   Take receipt photo,          Matches receipt to bank         Resolves duplicate charges          Flags uncredited returns,
   or type quick note           statement, extracts items       via simple UI card                  answers spending questions
```

* **Workflow 1: Everyday Ingestion (30 Seconds):** After shopping at Trader Joe’s, the user snaps a photo of the receipt and drops it into the chat console. In 2 seconds, the Ingestion Agent extracts 4 line items, tax, and total ($42.18) with a 0.96 confidence score and logs it to the verified ledger.
* **Workflow 2: Hands-Free Return Tracking:** The user drops a Zara return slip for an $89.00 jacket. SpendTrace logs it in `Awaiting Credit`. If no refund appears on the statement after 10 days, SpendTrace fires a red alert:  
  *🔴 "Action Required: Return to Zara for $89.00 on Oct 12 has not posted to your Chase card. Click here to copy a dispute email."*
* **Workflow 3: Duplicate Charge Intercept (HITL):** When importing a monthly bank CSV with two identical $18.50 charges at the same diner within 2 hours, the agent pauses via `interrupt()` and presents a clean card:  
  *`"We noticed two $18.50 charges at Joe's Diner on Oct 24. Merge as one, or did you make two purchases?"`* `[Merge as Duplicate] [Keep Both]`
* **Workflow 4: Conversational Financial Pulse:** The user asks: *"Why did my dining spending increase this month?"* SpendTrace runs a deterministic SQL query and explains:  
  *"Dining spending increased by $240 (+38%) compared to last month, driven by 3 weekend dinners: Nobu ($145), Osteria ($68), and Blue Ribbon ($48)."* (With clickable links to supporting receipt items).

## 3. Product Principles

1. **Task Completion over Single-Shot LLM Output:** An agent is not a chatbot; it must drive the workflow to an end state (extraction $\rightarrow$ cross-referencing $\rightarrow$ persistent storage $\rightarrow$ reconciliation).
2. **Deterministic Math, Probabilistic Understanding:** LLMs parse text and vision; deterministic SQL and code run calculations. The LLM must **never** perform mental arithmetic on financial figures.
3. **Write Actions Deserve Human Approval:** Any write action that modifies historical data, resolves duplicates, or updates records must be explicitly approved or operate within strictly defined human-in-the-loop (HITL) confidence thresholds.
4. **Data Provenance & Traceability:** Every analytic response (e.g., *"Dining spending grew by $240"*) must link directly to the underlying primary keys of the supporting transaction records and the exact trace run ID that computed it.
5. **Continuous Evaluation & Radical Observability:** Quality cannot be assumed; it must be provable via an in-app evaluation testbench and real-time execution telemetry.
6. **Cost-of-Goods-Sold (COGS) Efficiency:** Architecture must run with minimal token waste through tiered routing, caching, and local-first execution.

---

## 4. Feature Requirements & Functional Specifications

### 4.1 Input Ingestion & Multi-Source Extraction
- **FR-1.1: Natural Language Expense Logging:** The user can input free-form conversational text (e.g., *"Paid $18.50 for parking at City Garage today"*). The Ingestion Agent extracts: `merchant`, `amount`, `date` (resolving relative dates like "today", "yesterday", "last Friday"), `category_hint`, and `notes`.
- **FR-1.2: Receipt Image & PDF Processing:** Users can upload images (JPEG, PNG, HEIC) or single-page PDF receipts. The agent extracts:
  - Header: Merchant name, address/store number, date, time.
  - Financials: Subtotal, tax, tip, total amount, payment method (last 4 digits).
  - Line Items: Item name, quantity, unit price, total item price.
- **FR-1.3: Bank & Card CSV Statement Import:** Users can drag-and-drop CSV exports from standard banks (e.g., Chase, Amex, Bank of America, Apple Card, or generic CSV). The agent parses headers dynamically, identifies columns (`Date`, `Description`, `Amount`, `Category`), and imports records.
- **FR-1.4: Extraction Confidence Scoring:** Every parsed record receives a confidence score between 0.00 and 1.00. Records with confidence $< 0.80$ are marked `needs_review` and trigger human clarification.

### 4.2 Deduplication & Entity Resolution
- **FR-2.1: Receipt-to-Transaction Matching:** When both a receipt and a statement charge exist, the agent links them using fuzzy merchant matching (Levenshtein distance), transaction date ($\pm 3$ days window), and exact amount matching.
- **FR-2.2: Duplicate Charge Flagging:** Detects identical charges (same merchant, same amount, same date $\pm 24$ hours) originating from statement feeds and flags them as potential duplicate swipes.

### 4.3 Refund Reconciliation & Orphan Return Radar
- **FR-3.1: Return Slip Ingestion:** Ingests return receipts or return confirmation emails indicating merchandise was sent back for refund.
- **FR-3.2: Statement Credit Matching:** Matches negative transaction amounts (credits) against pending return records based on merchant and refund amount ($\pm 5\%$ for restocking fee variances).
- **FR-3.3: Orphan Return Alerts:** Flags any return record that has remained without a matching statement credit for $> 10$ business days. Renders an alert in the UI: *"Action Required: Return to [Merchant] for [$Amount] on [Date] has not posted."*

### 4.4 Spending Intelligence & Natural Language Querying (NL-to-SQL)
- **FR-4.1: Natural Language Financial Analytics:** Users can query spending trends in natural language (e.g., *"Why did my spending increase this month?"*, *"What are my top 5 recurring subscriptions?"*).
- **FR-4.2: Deterministic SQL Execution:** Queries are translated into read-only, parameterized SQL executed against the local SQLite database.
- **FR-4.3: Ground-Truth Explanations:** The agent produces an explanatory summary accompanied by a table of supporting transaction records with clickable IDs.

### 4.5 Human-in-the-Loop (HITL) & Clarification Workflows
- **FR-5.1: Interactive Clarification Cards:** If a receipt has ambiguous data (e.g., blurry total, unreadable date), the agent presents a card with pre-filled guesses for 1-click user verification.
- **FR-5.2: Write Action Intercept:** Deletions, manual transaction merges, and duplicate dismissals require explicit user confirmation via LangGraph interrupts.
- **FR-5.3: Memory of Corrections:** When a user reclassifies a merchant (e.g., *"Shell is always Business Travel, not Personal Fuel"*), the agent updates persistent user classification rules.

### 4.6 Continuous Evaluation & Benchmarking (Evals Tab)
- **FR-6.1: In-App Eval Suite Execution:** Users or engineers can trigger automated evaluation runs across multiple benchmark categories:
  - *Receipt OCR Extraction Benchmark:* 20 diverse receipts (clear, faded, multi-item, wrinkled).
  - *Deduplication & Entity Resolution Benchmark:* 15 challenging pairs (true duplicates vs distinct same-day purchases).
  - *Refund Reconciliation Benchmark:* 10 return slips tested against matching and non-matching statement credits.
  - *NL-to-SQL Analytics Benchmark:* 25 natural language financial queries evaluated for SQL correctness, execution safety, and arithmetic exactness.
- **FR-6.2: Real-Time Eval Progress & Metrics Dashboard:** Displays live test suite execution progress bar, overall Pass/Fail %, Field-level Precision/Recall/F1, P50/P95 latency, and token cost per test.
- **FR-6.3: Ground-Truth vs Prediction Diff Viewer:** Allows clicking any test case to inspect side-by-side JSON diffs highlighting missing items, incorrect totals, or hallucinated fields.
- **FR-6.4: Regression Tracking:** Stores historical eval run results in the database to detect accuracy drops across model or prompt updates.

### 4.7 End-to-End System Observability & Tracing (Observability Tab)
- **FR-7.1: Live Execution Trace Stream:** Captures and displays every user interaction as a structured trace tree with status (`Success`, `HITL_Paused`, `Failed`, `Retried`).
- **FR-7.2: Waterfall Gantt Execution Spans:** Visual breakdown showing the exact duration (ms) of each sub-agent node: `Supervisor` $\rightarrow$ `Extractor` $\rightarrow$ `Reconciler` $\rightarrow$ `DB Commit`.
- **FR-7.3: Deep Node Inspector:** Clicking any execution node exposes:
  - Exact System & User Prompts sent to LLM/Vision models.
  - Raw Model Response & Parsed Pydantic Payload.
  - Tool Invocation arguments and return outputs.
  - Token Consumption (Prompt tokens, Completion tokens, Total).
  - Real-time Cost Estimation in USD ($).
- **FR-7.4: Error & Retry Diagnostics:** Surfaces tool failures, SQLite syntax errors, schema auto-repair loops, and image retry events with full stack traces.

### 4.8 Data Management & Portability
- **FR-8.1: Record Editing & Audit Trail:** Full UI capability to manually edit, tag, or delete any record, with timestamps logged in an audit table.
- **FR-8.2: 1-Click Export:** 1-click export of reconciled transactions, itemized line items, and eval reports to CSV / JSON.
- **FR-8.3: Local Data Isolation:** Complete support for local database persistence with zero retention on third-party model servers.

### 4.9 Supabase Open-Source Authentication & Role-Based Access Control (IAM)
- **FR-9.1: Supabase GoTrue Auth Standard:** Authentication conforms to the open-source Supabase GoTrue standard ([SRP-alohamora/supabase-opensrc-auth](https://github.com/SRP-alohamora/supabase-opensrc-auth)). Emits standard JWTs with `sub`, `iss: 'supabase'`, `aud: 'authenticated'`, and `app_metadata.role: 'admin' | 'member'`.
- **FR-9.2: PostgreSQL & RLS Multi-Tenant Architecture:** Persistent data is structured via `backend/db/postgres_schema.sql` utilizing Row Level Security (RLS) policies scoped to `auth.uid() = user_id`. Seamless fallback to SQLite with Write-Ahead Logging (WAL) and `PRAGMA busy_timeout = 30000;` ensures reliable multi-user operation in all deployment environments.
- **FR-9.3: Admin Mode Elevation & IAM Barrier:** Administrative tools (Model Evals and Observability Traces) require `app_metadata.role = 'admin'`. Non-admin members attempting to view these tabs encounter a clean Google-style IAM Barrier with a 1-click elevation switch for development and demonstration.
- **FR-9.4: Public Demonstration vs. Authenticated Accounts:** A pre-seeded benchmark account (`admin@spendtrace.ai`) provides 11 synthetic transactions and returns for zero-friction public evaluation. 

### 4.10 Clean Slate Invariant & Factual Grounding
- **FR-10.1: Clean Slate Invariant for New Users:** Any newly registered user or clean account is strictly guaranteed to start with 0 transactions, 0 receipts, and 0 return reconciliations. Every receipt image, conversational note, and bank CSV uploaded by that user is persistently stored in the database scoped to their unique `user_id`.
- **FR-10.2: Factual Grounding & Verifiable Citations:** When users ask questions (e.g., *"Why did my spending increase this month?"* or *"Which returns have no matching refund?"*), the agent computes answers via deterministic SQL aggregate queries over the user's verified records. The agent strictly cites exact database primary keys (e.g., `tx_4a1f...`, `ret_9c2b...`) and provides clickable citation pills. Arithmetic hallucination is mathematically impossible.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Latency
- **NFR-1.1:** Natural language chat responses stream initial tokens within $< 1.5$ seconds.
- **NFR-1.2:** Receipt image extraction and schema validation complete within $< 4.0$ seconds.
- **NFR-1.3:** SQL database analytical queries execute in $< 50$ ms.
- **NFR-1.4:** Observability telemetry instrumentation overhead must not exceed $15$ ms per trace span.

### 5.2 Accuracy & Reliability
- **NFR-2.1 (Extraction Precision):** Total amount and date extraction must achieve $\ge 98\%$ on clear receipts, and $\ge 90\%$ on degraded receipts.
- **NFR-2.2 (Financial Determinism):** All calculations must be computed by database aggregate functions (`SUM()`, `AVG()`), never estimated by LLM weights.
- **NFR-2.3 (Zero Hallucinated Writes):** The agent cannot commit synthetic or assumed transactions without confidence verification.

### 5.3 Security & Privacy
- **NFR-3.1:** Financial data stored locally in SQLite with WAL (Write-Ahead Logging).
- **NFR-3.2:** Sensitive PII (card numbers beyond last 4 digits, billing addresses) stripped during preprocessing.
- **NFR-3.3:** Read-only database user credentials enforced for the NL-to-SQL Analytics Agent (`PRAGMA query_only = ON;`).

### 5.4 Cost of Goods Sold (COGS)
- **NFR-4.1:** Average cost per processed receipt must not exceed **$0.003** (3/10ths of a cent) using Gemini 2.0/1.5 Flash.
- **NFR-4.2:** Average cost per analytical query must not exceed **$0.0005**.
- **NFR-4.3:** Running the full 70-test evaluation suite must cost under **$0.05** total.

---

## 6. User Experience & Design System (White Google-like Sparse UX)

![SpendTrace White Sparse UX Front Page with Muse Refund Animation](./docs/spendtrace_ux_hero.jpg)

### 6.1 Design Philosophy: Minimalist, Sparse, and Distraction-Free
SpendTrace adopts a **pure white, sparse, Google-like interface** inspired by the clean aesthetics of Google Search, Google Drive, and Google Workspace (Material 3). The design prioritizes generous whitespace, crisp typography, and subtle hairline borders, completely avoiding heavy gradients, cluttered dashboards, or aggressive animations.

#### 6.1.1 Color Tokens & Design System
* **Primary Canvas:** `#FFFFFF` (Pure White)
* **Surface Secondary / Cards:** `#F8F9FA` (Google Off-White) / `#F1F3F4` (Hover & Sub-surfaces)
* **Hairline Borders & Dividers:** `1px solid #DADCE0`
* **Typography & Text:**
  * Primary Text / Headings: `#202124` (Google Charcoal)
  * Secondary Text / Labels / Subtitles: `#5F6368` (Google Medium Slate)
  * Font Family: `Google Sans`, `Roboto`, `Inter`, -apple-system, sans-serif
* **Google Semantic State Badges:**
  * **Interactive / Primary Blue:** `#1A73E8` (Active tab underline, primary action buttons, clickable citation chips)
  * **Verified / Success Green:** `#1E8E3E` (Text) on `#E6F4EA` (Background pill)
  * **Pending / Clarification Amber:** `#D97706` (Text) on `#FEF7E0` (Background pill)
  * **Alert / Overdue Red:** `#D93025` (Text) on `#FCE8E6` (Background pill)

#### 6.1.2 Input & Component Styling
* **The "Google Pill" Prompt Bar:** A minimalist, floating search/chat bar (`border: 1px solid #DADCE0`, `border-radius: 24px`, `padding: 12px 20px`) with subtle elevation on hover/focus (`box-shadow: 0 1px 6px rgba(32,33,36,0.18)`), featuring inline upload and send action icons.
* **Minimalist Workspace Tabs:** A clean horizontal top bar with simple text tabs and a 3px `#1A73E8` bottom indicator line for the active tab.
* **Sparse Ledger Rows:** Generous 14px row padding, subtle hairline dividers (`#F1F3F4`), right-aligned monospace numbers, and zero visual noise.

---

### 6.2 Tab Navigation Architecture

The application is structured into **4 sparse, focused tabs**:

```
+------------------------------------------------------------------------------------------------------------------------+
|  SpendTrace       Assistant & Ledger     Refund Radar     Model Evals ᵃᵈᵐⁱⁿ ᵐᵒᵈᵉ     Observability ᵃᵈᵐⁱⁿ ᵐᵒᵈᵉ   [Admin Mode ▼]|
|                   ==================                                                                                   |
+------------------------------------------------------------------------------------------------------------------------+
```

#### Top Navigation & IAM Role Selector
* **User Identity & Role Selector:** Located at the top right of the navigation bar, displays the authenticated user's email, avatar, and active role pill (`Admin Mode` vs `Member (Clean Slate)`). Provides 1-click toggling between the pre-seeded public demonstration account and a pristine clean-slate user account, plus options to clear data or re-seed benchmark data.
* **Administrative Superscripts:** The tabs **Model Evals** and **Observability & Traces** feature an explicit superscript badge (`admin mode`) indicating restricted operational controls.

#### 6.2.1 Tab 1: Assistant & Live Ledger (Dual-Pane Sparse Workspace)
* **Left Pane (40% width): Conversational Agent Console**
  - Clean white thread timeline with subtle message bubbles (User: `#F1F3F4`, Agent: transparent with `#1A73E8` icon).
  - Minimalist dashed dropzone (`border: 1.5px dashed #DADCE0`, `border-radius: 12px`, `#FAFAFA` bg) for receipt images and bank CSV files.
  - Interactive HITL Clarification Cards with crisp `#DADCE0` borders and clean Google-style action buttons (`#1A73E8` primary, `#5F6368` outline).
* **Right Pane (60% width): Live Ledger & Receipt Inspector**
  - Clean statistical summary chips: `Total Spend: $1,420.50`, `Pending Refunds: 1 ($89.00)`, `Requires Review: 1`.
  - Searchable, filterable transaction table with Google-style pill badges (`Verified`, `Needs Review`, `Duplicate`).
  - Slide-over side-by-side receipt image viewer with clean bounding box highlights and extracted item cards.
  - **Clean Slate Hero Card:** When a new user logs in (0 transactions), a Google-style welcoming empty state card prompts them to upload their first receipt or CSV statement, or try conversational expense logging.

#### 6.2.2 Tab 2: Refund Radar (Return & Refund Tracker)
* Sparse, kanban-style lifecycle columns on a clean white canvas:
  `1. Returns Logged` $\rightarrow$ `2. Awaiting Card Credit` $\rightarrow$ `3. Reconciled` $\rightarrow$ `4. Overdue (>10 Days)`.
* Overdue items highlighted with a soft red pill (`#FCE8E6` bg, `#D93025` text) and a 1-click action to generate a merchant inquiry note.

#### 6.2.3 Tab 3: Model Evals & Quality Suite ᵃᵈᵐⁱⁿ ᵐᵒᵈᵉ
* Superscript badge: `'admin mode'` in navigation and header.
* **IAM Admin Barrier:** When viewed by a standard member account, renders a clean Google-style access barrier explaining that model evaluations consume inference credits, offering a 1-click elevation button to switch to Admin Mode.
* Clean scorecards with thin `#DADCE0` borders displaying accuracy %, P95 latency, and test cost.
* Sparse test case matrix with green/red status pills (`PASS` / `FAIL`).
* Side-by-side ground truth vs predicted JSON diff viewer with subtle green/red text highlights.

#### 6.2.4 Tab 4: Agent Observability & Traces ᵃᵈᵐⁱⁿ ᵐᵒᵈᵉ
* Superscript badge: `'admin mode'` in navigation and header.
* **IAM Admin Barrier:** Non-admin accounts see an access guard with elevation toggle.
* Clean trace timeline showing user interactions, latency (ms), token counts, and cost ($).
* Waterfall Gantt charts and deep span inspectors detailing prompts, responses, tool calls, and exact token costs.
* Clean horizontal waterfall Gantt chart displaying sub-agent spans in Google Blue (`#1A73E8`).
* Node inspector drawer exposing exact prompts, model outputs, and tool logs in clean monospace code blocks on `#F8F9FA`.
  - Status Pills (`PASS` / `FAIL`), Test Category, Execution Time, Token Cost.
  - **Ground Truth vs Predicted Inspector:** Visual side-by-side JSON diff highlighting any extraction discrepancy.
  - **Regression History Chart:** Line graph showing accuracy trends across last 10 test suite runs.

### 6.4 Tab 4: Agent Observability & Traces
* **Live Trace Feed:** Filterable stream of all agent invocations (Chat, Receipt Upload, CSV Ingest, Analytical Query).
* **Waterfall Gantt Chart:** Visual execution timeline displaying sequential and parallel sub-agent spans.
* **Deep Span Inspector Drawer:**
  - Displays: `Node Name`, `Execution Latency (ms)`, `Tokens In/Out`, `Calculated Cost ($)`.
  - Raw JSON input state passed into the node.
  - System and User prompts formatted with markdown highlighting.
  - Raw LLM/tool output and sanitized state mutations.

---

## 7. Success Metrics & Acceptance Criteria

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **End-to-End Extraction Accuracy** | $\ge 92\%$ | Evaluated automatically via in-app Evals Tab benchmark against 50 diverse receipt test cases. |
| **Deduplication Precision** | $\ge 95\%$ | Synthetic injection of duplicate statement transactions and overlapping receipts. |
| **Orphan Return Detection Recall** | $100\%$ | Return slips with no matching credit after 10 days flagged without omission. |
| **SQL Execution Safety & Determinism** | $100\%$ | 0 write queries permitted; 100% of arithmetic calculations executed via SQL aggregate functions. |
| **Observability Trace Coverage** | $100\%$ | Every multi-agent execution generates a complete, inspectable span tree in the Observability Tab. |
| **Zero-Correction Rate** | $\ge 85\%$ | Transactions committed without requiring user manual override. |

---

## 8. Out of Scope (Future Roadmap)

- Direct OAuth Bank Connection (Plaid / Teller API integration) — Phase 2.
- Direct Email Inbox Scraper (IMAP / Gmail API token integration) — Phase 2.
- Multi-currency automatic Forex hedging.
- Automated merchant chargeback filing.
