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

### 4.6 Continuous Evaluation & Benchmarking Suite (Evals Tab)
The evaluation system is accessible to all users via the **Evals** tab. It provides deterministic financial assertions, statistical extraction metrics, ledger invariant verification, and Refund Radar specialized rubrics to guarantee that SpendTrace functions as a dependable financial copilot rather than a hallucinating chatbot.

#### 4.6.1 The 15 Core Product Evaluations
To protect financial ledger integrity and consumer trust, the harness enforces 15 foundational evaluations across extraction, entity resolution, reconciliation, refund reasoning, and security:

| # | Evaluation Criterion | What It Tests | Suggested Target / Metric | MVP Priority |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Receipt extraction** | Extract merchant, date, tax, items and total from photos/PDFs | Critical-field accuracy $\ge 98\%$ | ⭐ **MVP Priority** |
| **2** | **Transaction categorization** | Classify spending into Grocery, Apparel, Dining, Utilities, etc. | Macro-F1 $\ge 95\%$ | ⭐ **MVP Priority** |
| **3** | **Merchant normalization** | Recognize `WM SUPERCENTER #1234` as `Walmart` | Accuracy $\ge 98\%$ | Roadmap |
| **4** | **Duplicate detection** | Avoid double-counting bank feeds, emails and receipts | Precision $\ge 99\%$ | ⭐ **MVP Priority** |
| **5** | **Receipt-to-payment matching** | Associate a receipt with the correct bank transaction | Match precision $\ge 99\%$ | ⭐ **MVP Priority** |
| **6** | **Item-level categorization** | Split mixed purchases into multiple spending categories | Item-level F1 $\ge 93\%$ | Roadmap |
| **7** | **Ledger reconciliation** | Ensure totals, taxes, splits and refunds reconcile | Financial invariant violations = 0 | ⭐ **MVP Priority** |
| **8** | **Spending insight accuracy** | Produce explanations supported by historical transactions | Unsupported numeric claims = 0 | Roadmap |
| **9** | **Refund opportunity detection** | Find purchases where return/refund review is warranted | Precision $\ge 95\%$ for actionable alerts | Roadmap |
| **10** | **Refund eligibility reasoning** | Assess merchant policy, dates and product restrictions | Unsupported eligibility claims = 0 | ⭐ **MVP Priority** |
| **11** | **Refund workflow planning** | Select the correct refund path and required next steps | Successful plan rate $\ge 95\%$ | Roadmap |
| **12** | **Refund status tracking** | Identify refund initiated, pending, completed or denied | State accuracy $\ge 99\%$ | Roadmap |
| **13** | **Refund reconciliation** | Match merchant refund to posted card/bank credit | Match precision $\ge 99\%$ | ⭐ **MVP Priority** |
| **14** | **User-intent understanding** | Correctly interpret natural-language expense/refund instructions | Task accuracy $\ge 95\%$ | Roadmap |
| **15** | **Authorization and privacy** | Prevent wrong-account access and unauthorized submissions | Critical violations = 0 | Hard Gate |

> **MVP Priority Focus:** Prioritizing #1, #2, #4, #5, #7, #10, and #13 protects the fundamental reliability of financial data and the credibility of the autonomous refund agent.

#### 4.6.2 Concrete Benchmark Scenarios (E1 – E7)
The evaluation suite grounds tests against four canonical transactions:
* **Restaurant:** $46.70 (Expected Category: *Outside Food*)
* **Marshalls:** $38.69 (Expected Category: *Apparel*)
* **Walmart:** $88.92 (Expected Category: *Grocery*)
* **AT&T:** $75.00 (Expected Category: *Utility Bills*)  
* **Total Net Spend:** **$249.31**

Seven immediate test scenarios validate robustness against real-world failure modes:
1. **E1. The imperfect receipt:** Upload a tilted Walmart receipt with faint text, multiple products, discounts, taxes, and final total ($88.92).  
   *Pass Criteria:* Extract correct amounts ($82.14 subtotal, $6.78 tax), avoid inventing unreadable fields, and flag uncertain values for human confirmation.
2. **E2. The mixed-category Walmart purchase:** An $88.92 basket contains $60.00 groceries and $28.92 clothing.  
   *Pass Criteria:* Allocate $60.00 to Grocery and $28.92 to Apparel, with no cent lost or double-counted.
3. **E3. The duplicate receipt:** The user forwards the Marshalls $38.69 receipt by email, uploads a photo of the receipt, and imports the card swipe.  
   *Pass Criteria:* Produce 1 unified purchase with 3 linked evidence sources, rather than 3 separate expenses.
4. **E4. The ambiguous instruction:** User: *"That Walmart thing I bought last week, can I get my money back?"*  
   *Pass Criteria:* Locate plausible transactions and prompt user which item is involved, without assuming everything is returnable.
5. **E5. Refund eligibility reasoning:** User wants to return a worn Marshalls garment 74 days after purchase (past the 30-day window).  
   *Pass Criteria:* Consult retailer policy, distinguish refund from merchandise credit or exception requests, and never assert guaranteed eligibility without evidence.
6. **E6. Partial refund reconciliation:** A $38.69 purchase receives a verified $12.00 statement credit.  
   *Pass Criteria:* Preserve the original payment, record the linked credit, and show $26.69 net spend without creating a phantom purchase.
7. **E7. Refund promised but not received:** Merchant confirms a $38.69 refund, but no credit appears in bank feed after 10 days.  
   *Pass Criteria:* Keep the refund in pending/overdue status and flag it for follow-up rather than reporting $38.69 recovered.

#### 4.6.3 Refund Radar: 5 Specialized Autonomy Evaluations
Refund Radar moves SpendTrace from recording past spending to actively recovering money:
* **A. Refund opportunity ranking:** Evaluates whether the agent prioritizes genuinely actionable opportunities over speculative ones across Marshalls apparel (check eligibility), Walmart groceries (do not suggest routine return), and AT&T bill (investigate billing error).  
  *Metric:* **Precision@3** (number of top 3 surfaced opportunities that are truly actionable).
* **B. Policy-grounded eligibility:** Evaluates merchant return policies against transaction dates, exclusions, condition, proof of purchase, and tender.  
  *Metric:* Exact-rule grading for dates/amounts + rubric for nuanced policy interpretation (0 unsupported claims).
* **C. Refund agent tool selection:** Validates execution of the 5-step tool sequence: (1) Search ledger & receipt $\rightarrow$ (2) Retrieve merchant policy $\rightarrow$ (3) Prepare refund request $\rightarrow$ (4) Request human confirmation $\rightarrow$ (5) Monitor status.  
  *Metric:* Valid tool-sequence completion rate ($\ge 95\%$).
* **D. Refund value accounting (Financial State Machine):** Enforces a strict separation of states:
  * *Potential refund:* $38.69 (Opportunity identified)
  * *Refund requested:* $38.69 (Merchant request submitted)
  * *Refund approved:* $38.69 (Merchant approved return)
  * *Money recovered:* $0.00 (Until bank statement credit is verified)  
  *Rule:* The financial state machine matters as much as the LLM. A successful refund request is never counted as money recovered.
* **E. Refund vs. billing dispute (CFPB Adversarial Evaluation):** Differentiates voluntary retailer returns, missing refunds, duplicate charges, and unauthorized transactions. Enforces statutory compliance with Consumer Financial Protection Bureau (CFPB) Regulation Z (§ 1026.13) dispute notice requirements to prevent sending consumers down incorrect legal paths.

#### 4.6.4 Practical Evaluation Scorecard & Mathematical Formulas
Internal release scorecard weights and diagnostic release gates:
* **Transaction & receipt accuracy:** 97% observed · **25% weight**
* **Categorization & insights:** 94% observed · **20% weight**
* **Refund eligibility & planning:** 89% observed · **25% weight**
* **Refund tracking & reconciliation:** 96% observed · **20% weight**
* **Agent workflow efficiency:** 91% observed · **10% weight**
* **Overall Default Weighted Score:** **93.6%** (Target: **95.0%**)

> **Hard Release Gates:** The weighted aggregate is a diagnostic summary. Critical financial invariant violations (invariant errors = 0) and authorization breaches (violations = 0) independently block release, even with high aggregate scores.

| Metric | Formula | Why It Matters |
| :--- | :--- | :--- |
| **Category precision** | $\frac{\text{Correctly predicted instances of cat}}{\text{All predicted instances of cat}}$ | Prevents mislabeled expenses |
| **Category recall** | $\frac{\text{Correctly predicted instances of cat}}{\text{All true instances of cat}}$ | Measures missed classifications |
| **Duplicate-detection precision** | $\frac{\text{Correct duplicate flags}}{\text{All duplicate flags}}$ | Avoids incorrectly merging separate real purchases |
| **Refund opportunity precision** | $\frac{\text{Valid opportunities alerted}}{\text{All opportunities alerted}}$ | Avoids misleading refund suggestions |
| **Refund opportunity recall** | $\frac{\text{Valid opportunities alerted}}{\text{All known valid opportunities}}$ | Surfaces actionable refunds users miss |
| **Refund reconciliation accuracy** | $\frac{\text{Correctly reconciled refunds}}{\text{Refunds eligible for reconciliation}}$ | Ensures ledger financial reliability |
| **Agent task success** | $\frac{\text{Correctly completed tasks}}{\text{Total evaluated tasks}}$ | Measures end-to-end agent workflow execution |

#### 4.6.5 200-Case Evaluation Dataset Breakdown
The evaluation dataset contains 200 curated, stratified test cases:
* **Receipt extraction (40 cases):** Faded thermal receipts, taxes, multi-item baskets, discounts.
* **Categorization (40 cases):** Walmart mixed baskets, Amazon purchases, ambiguous vendor names.
* **Duplicate detection and reconciliation (30 cases):** Email + bank duplicates, pending vs posted transactions.
* **Refund eligibility (35 cases):** Return windows, excluded categories, missing receipts.
* **Agent workflow (30 cases):** Tool failures, policy lookups, human approvals, retries.
* **Refund settlement (25 cases):** Partial refunds, delayed statement credits, split tenders.

Sample evaluation test schema (`REFUND_001`):
```json
{
  "eval_id": "REFUND_001",
  "scenario": "Partial clothing return",
  "input": {
    "merchant": "Marshalls",
    "purchase_amount": 38.69,
    "refund_credit": 12.00,
    "refund_posted": true
  },
  "expected": {
    "original_purchase": 38.69,
    "refund_received": 12.00,
    "net_spend": 26.69,
    "refund_status": "partially_refunded"
  },
  "assertions": [
    "preserve_original_transaction",
    "link_refund_to_purchase",
    "no_double_counting",
    "correct_net_spend"
  ]
}
```

#### 4.6.6 Long-Term Ambitious Evaluations
1. **Financial Memory Eval:** Evaluates retention of user-specific classification overrides and exceptions across sessions (e.g., *"Always categorize Sweetgreen as Outside Food, except when I buy bottled drinks for an office event"*).
2. **Counterfactual Refund Eval:** Evaluates stability of reasoning when exactly one factual premise changes (e.g., purchase made 10 days ago vs 60 days ago under a 30-day policy).
3. **Autonomous Recovery Eval:** Evaluates graceful recovery when merchant portals fail, links expire, or authentication is required, handing off cleanly to human review instead of fabricating claims.

#### 4.6.7 Recommended MVP Build Order
1. **First (Foundation):** Receipt extraction, categorization, duplicate detection, and ledger reconciliation. Future-proofed to ingest receipts, CSV statements, Excel spreadsheets (.xlsx, .xls), PDFs, and Plaid API streams.
2. **Second (Intelligence):** Refund eligibility reasoning and policy grounding.
3. **Third (Value Capture):** End-to-end refund concierge, status tracking, and settlement reconciliation.

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

#### 6.2.0 First-Time User Experience (Background Hero Login)
When an unauthenticated or first-time user visits SpendTrace, the application renders a clean, focused authentication card overlaid on the full-screen background graphic (`spendtrace_frontpage.jpg`). The legacy marketing frontpage is completely removed. Users can sign in or sign up using email/password, or use 1-click quick credentials to access:
- **Shivani Pradhan (Admin / Demo Account):** Pre-seeded with 4 benchmark transactions ($249.31), 3 active refund radar cases, and real-time ledger items.
- **Alex Chen (Clean Slate Member):** Pristine zero-data state for testing fresh onboarding and receipt extraction.

Once authenticated, the user is navigated directly to **Home** (Assistant & Live Ledger) by default.

```
+---------------------------------------------------------------------------------------------------------------------------------------------------+
|  SpendTrace       🏠 Home     Refund Radar     Plaid & Cards     Why SpendTrace     Evals     Trace & Analyze ᵘⁿᵈᵉʳ ᶜᵒⁿˢᵗʳᵘᶜᵗⁱᵒⁿ   [Shivani Pradhan ▼]|
|                   =======                                                                                                                         |
+---------------------------------------------------------------------------------------------------------------------------------------------------+
```

#### Top Navigation & Tab Hierarchy
* **Tab 1: 🏠 Home (Assistant & Live Ledger):** The primary operational workspace combining natural language financial assistance, live ledger reconciliation, and the dynamic **Spending Analysis & Financial Pulse** widget (1, 2, 3, 4 weeks / months dropdowns) featuring North Star recovery metrics.
* **Tab 2: Refund Radar:** End-to-end return opportunity detector, policy compliance checker, merchant email generator, and credit reconciliation board.
* **Tab 3: Plaid & Credit Cards:** Card liabilities, APRs, utilization alerts, and Plaid transaction sync interface.
* **Tab 4: Why SpendTrace:** Interactive sandbox demonstrating how SpendTrace solves Mint's pain points (deterministic reconciliation, item-level splits, and autonomous money recovery).
* **Tab 5: Evals (Visible to All Users):** Comprehensive model and agent evaluation benchmark suite featuring the 15 Core Evals, Concrete Scenarios E1–E7, 5 Refund Radar specialized evals, dynamic 93.6% weighted scorecard, and 200-case dataset breakdown.
* **Tab 6: Trace & Analyze ᵘⁿᵈᵉʳ ᶜᵒⁿˢᵗʳᵘᶜᵗⁱᵒⁿ (Visible to All Users):** Observability and execution telemetry console displaying sub-agent spans, token consumption, latency waterfalls, and node inspection drawers. Flagged with a prominent `Under Construction` banner and superscript badge.

#### 6.2.1 Tab 1: 🏠 Home (Dual-Pane Sparse Workspace & Spending Analysis)
* **Top Spending Analysis & Financial Pulse Widget:**
  - Configurable time window: Count selector (`1`, `2`, `3`, `4`) and Unit selector (`Weeks`, `Months`).
  - Defaults to **Last 1 Week**, benchmarked against 4 core purchases:
    - *Restaurant:* $46.70 (Outside Food)
    - *Marshalls:* $38.69 (Apparel)
    - *Walmart:* $88.92 (Grocery)
    - *AT&T:* $75.00 (Utility Bills)
    - **Total Spend:** $249.31
  - Displays the 3 North Star Product Metrics cards:
    - *Verified Refund Dollars Recovered / MAU:* $42.50 / user
    - *User Effort per Successful Refund:* 1-Click Loop Closure
    - *False Refund Opportunity Rate:* 0.0% (High-precision guardrails)
* **Left Pane (40% width): Conversational Agent Console**
  - Clean white thread timeline with subtle message bubbles (User: `#F1F3F4`, Agent: transparent with `#1A73E8` icon).
  - Minimalist dashed dropzone (`border: 1.5px dashed #DADCE0`, `border-radius: 12px`, `#FAFAFA` bg) for receipt images, bank CSVs, and Excel files.
  - Interactive HITL Clarification Cards with crisp `#DADCE0` borders and clean action buttons.
* **Right Pane (60% width): Live Ledger & Receipt Inspector**
  - Summary metrics: Total Spend, Net Spend, Verified Transactions, Pending Refunds.
  - Searchable, filterable transaction table with Google-style pill badges (`Verified`, `Needs Review`, `Duplicate`).
  - Slide-over side-by-side receipt image viewer with bounding box highlights and extracted item cards.
  - Clean-slate hero card when 0 transactions exist.

#### 6.2.2 Tab 2: Refund Radar (Return & Refund Tracker)
* Sparse, kanban-style lifecycle columns on a clean white canvas:
  `1. Opportunities Identified` $\rightarrow$ `2. Return Prepared / Drafted` $\rightarrow$ `3. Awaiting Bank Credit` $\rightarrow$ `4. Reconciled / Recovered` $\rightarrow$ `5. Overdue (>10 Days)`.
* Merchant policy grounding (e.g., Marshalls 30-day apparel window vs Walmart perishable exclusions).
* Automated email dispute drafting with human-in-the-loop review and 1-click "Complete Loop with AI".

#### 6.2.3 Tab 5: Evals (Thoughtful Continuous Benchmark Suite)
* Visible to all authenticated users without IAM admin barriers.
* Dynamic release scorecard (93.6% default score, 95% release target, 5 weighted categories with interactive sliders, 0 invariant violation hard release gate).
* 15 Core Product Evals with target metrics, current scores, and MVP priorities (#1, #2, #4, #5, #7, #10, #13).
* 7 Concrete Benchmark Scenarios (E1–E7) with 4-purchase baseline ($249.31), ground truth outputs, and automated deterministic assertions.
* 5 Refund Radar specialized evals (Opportunity Ranking with Precision@3, Policy Grounding, Tool Selection, Financial State Machine Accounting, CFPB Dispute Differentiation).
* Curated 200-case evaluation dataset breakdown and `REFUND_001` test record schema.
* 3 Long-Term Ambitious Evals (Financial Memory, Counterfactual Reasoning, Autonomous Recovery).

#### 6.2.4 Tab 6: Trace & Analyze ᵘⁿᵈᵉʳ ᶜᵒⁿˢᵗʳᵘᶜᵗⁱᵒⁿ
* Visible to all users with `<sup>Under Construction</sup>` superscript badge and header disclaimer banner.
* Live trace stream of all agent invocations (Chat, Receipt Extraction, SQL Analytics, Refund Workflow).
* Horizontal waterfall Gantt chart displaying sub-agent spans in Google Blue (`#1A73E8`).
* Node inspector drawer exposing exact prompts, model outputs, tool logs, latency (ms), and token costs.

---

## 7. Success Metrics & Acceptance Criteria

### 7.1 North Star Product Metrics
| Metric | Target | Measurement Method | Rationale |
| :--- | :--- | :--- | :--- |
| **Verified Refund Dollars Recovered per MAU** | **$\ge \$42.50$ / MAU** | Sum of ledger credits reconciled against merchant return receipts divided by active users in 30-day window. | Primary value driver distinguishing SpendTrace from passive expense recorders. |
| **User Effort per Successful Refund** | **1-Click Loop Closure** | Median user interactions from refund detection to settlement (one-click approval). | Measures convenience and frictionless autonomous resolution. |
| **False Refund Opportunity Rate** | **$0.0\%$** | Number of invalid/ineligible refund suggestions divided by total suggested opportunities (Precision $\ge 95\%$). | Protects user trust by preventing fruitless merchant disputes. |

### 7.2 Technical & Operational Acceptance Criteria
| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Critical Field Extraction Accuracy** | $\ge 98\%$ | Evaluated via Evals Tab on 40 receipt benchmark cases (merchant, date, total, tax). |
| **Transaction Categorization Macro-F1** | $\ge 95\%$ | Category prediction across Grocery, Apparel, Dining, Utilities on standard datasets. |
| **Deduplication Precision** | $\ge 99\%$ | Detection of overlapping email receipts, bank charges, and scanned slips. |
| **Financial Ledger Invariant Violations** | **0 Violations** | Hard release gate: sum of items + tax + tip must equal total; net spend = purchase - refund. |
| **SQL Execution Determinism** | $100\%$ | 0 write queries permitted in NL-to-SQL mode; all calculations executed via SQLite/PostgreSQL aggregate functions. |
| **Observability Trace Coverage** | $100\%$ | Every multi-agent invocation generates an inspectable span tree in Trace & Analyze. |
| **Zero-Correction Rate** | $\ge 85\%$ | Transactions committed without requiring user manual override. |

---

## 8. Out of Scope (Future Roadmap)

- Direct OAuth Bank Connection (Plaid / Teller API integration) — Phase 2 (Plaid sandbox interface live in Tab 3).
- Direct Email Inbox Scraper (IMAP / Gmail API token integration) — Phase 2.
- Multi-currency automatic Forex hedging.
- Automated merchant chargeback filing.
