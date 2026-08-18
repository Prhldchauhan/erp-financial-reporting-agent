# AI Agentic Architecture Document: ERP-Driven Financial Statement Generation

**System Name**: LedgerAgent (Autonomous Financial Statement Generation & Audit Governance Platform)  
**Target Ingestion**: NetSuite / SAP Trial Balances, Hierarchical Chart of Accounts, Journal Adjustments, Multi-Currency FX Schedules  
**Author**: Candidate for AI Agentic Engineer  
**Status**: Production-Ready Architectural Specification  

---

## 1. Executive Summary & Core Philosophy

Financial reporting is often misconstrued as an aggregation exercise. In enterprise finance, **arithmetic is straightforward ($O(N)$ sums), but accounting governance is non-negotiable**. 

The fundamental architectural principle of this system is:
> **"Deterministic code acts as the immutable ledger and mathematical guardian; LLM agents act as semantic analysts, anomaly interpreters, and human-in-the-loop escalators. An LLM must NEVER perform double-entry arithmetic."**

---

## 2. Agent Topology & Orchestration Pattern

### 2.1 Topology Selection: Hierarchical Orchestrator with Specialized Sub-Agents
We explicitly **reject** a single, monolithic agent with a wide tool suite, and we also reject unconstrained autonomous multi-agent "swarms". Instead, we implement a **Hierarchical Orchestration Pipeline with 4 Specialized Sub-Agents**:

```
                               ┌────────────────────────┐
                               │   Orchestrator Agent   │
                               │ (State Graph & Router) │
                               └───────────┬────────────┘
                                           │
         ┌──────────────────┬──────────────┴───────────────┬──────────────────┐
         ▼                  ▼                              ▼                  ▼
┌──────────────────┐ ┌──────────────────┐        ┌──────────────────┐ ┌──────────────────┐
│  1. Ingestion &  │ │  2. Semantic COA │        │ 3. Journal Entry │ │ 4. Statement &   │
│   FX Validator   │ │   Mapper Agent   │        │ Adjustment Agent │ │ Verification Ag. │
│   (Sub-Agent)    │ │   (Sub-Agent)    │        │   (Sub-Agent)    │ │   (Sub-Agent)    │
└──────────────────┘ └──────────────────┘        └──────────────────┘ └──────────────────┘
```

### 2.2 Justification for the 4 Sub-Agents
1. **Ingestion & FX Validator Sub-Agent**:
   - Isolates raw ERP parser defects (e.g. duplicate rows, invalid encoding, multi-currency headers).
   - Detects missing FX spot/average rates before ledger aggregation.
2. **Semantic COA Mapper Sub-Agent**:
   - Specializes in fuzzy matching, semantic embeddings, and hierarchical tree inference.
   - Computes explicit confidence scores $[0.0, 1.0]$ and triggers Human-in-the-Loop (HITL) review when confidence is below $0.90$.
3. **Journal Entry & Adjustment Reviewer Sub-Agent**:
   - Evaluates unposted batches against strict double-entry invariants ($\sum \text{Debits} = \sum \text{Credits}$).
   - Detects circular wash entries and missing account codes, isolates violating entries into a **Quarantine Ledger**, and explains rejections in plain English to the Controller.
4. **Statement Builder & Dual-Loop Verification Sub-Agent**:
   - Runs deterministic rollups for Balance Sheet, P&L, Indirect Cash Flow, and Statement of Changes in Equity (SOCIE).
   - Computes cryptographic cell-to-source directed acyclic graph (DAG) audit traces.
   - Conducts invariant verification ($A = L + E$, $\Delta \text{Cash}_{\text{CF}} = \Delta \text{Cash}_{\text{BS}}$, $\text{Net Income}_{\text{PL}} \to \text{Retained Earnings}_{\text{BS}}$).

---

## 3. The Deterministic vs. LLM Boundary

| Financial Pipeline Stage | Deterministic Code (Zero Tolerance) | LLM Reasoning & Agentic Intelligence |
| :--- | :--- | :--- |
| **Arithmetic & Aggregations** | Summing debits/credits, subtotals, ratios, rounding | *Forbidden from calculating sums or balances* |
| **Double-Entry Invariance** | Enforcing $\sum \text{Debits} - \sum \text{Credits} = 0$ | Explaining *why* an unbalanced entry failed and suggesting remediation |
| **COA Mapping** | Exact account code lookup & prefix matching | Semantic matching for renamed/ambiguous accounts with confidence score |
| **Cycle & Circular Detection** | Tarjan's / DFS cycle detection on transaction graphs | Explaining economic substance of circular intercompany wash entries |
| **FX Translation** | Math multiplication via rate tables (Spot vs. Avg) | Recommending rate interpolation and flagging unhedged translation exposure |
| **Audit Traceability** | Cell-level DAG lineage, deterministic row hashes | Generating executive variance commentary and narrative footnotes |

### Where Does AI Actually Earn Its Keep?
1. **Bridging Semantic Gaps**: Translating cryptic ERP names (e.g., `MISC_EXP_ALLOC_99`) into standard US GAAP / IFRS classification.
2. **Human-Grade Adjustment Triage**: Instead of a dry `Error Code 501`, the agent produces: *"Entry JE-002 rejected: Debits ($28,500) exceed Credits ($25,000) by $3,500. This $3,500 variance would cause an unbalance on line 6300 (Marketing)."*
3. **Anomaly & Variance Narrative**: Explaining period-over-period budget and comparative deltas line by line.

---

## 4. Production Failure Mode Handling Matrix

| Seeded / Real-World Defect | Failure Impact | Mitigation Mechanism & Self-Correction Protocol |
| :--- | :--- | :--- |
| **1. Unbalanced TB after FX Rounding** | $A \neq L + E$ by cents/dollars | **Deterministic Rounding Buffer**: Small rounding residuals ($< \$50.00$) are isolated and posted to a dedicated *Cumulative Translation Adjustment (CTA)* or *FX Rounding Reserve* equity line item, explicitly logged in the audit trail. |
| **2. Duplicate Account Code in Raw TB** | Double-counting balances | **Collision Deduplication Rule**: The Ingestion Agent detects duplicate `(account_code, currency)` tuples. If amounts conflict, it halts and prompts for primary ledger resolution; if split across currencies, it aggregates under functional currency after translation. |
| **3. Orphan Account (Not in COA)** | Missing balance sheet line | **Suspense Quarantine & Semantic Suggestion**: The balance is routed to a deterministic *Suspense / Unassigned Clearing* line item. The COA Mapper Agent generates a high-confidence mapping recommendation with 1-click Controller approval. |
| **4. Missing FX Spot Rate (e.g. CAD)** | Inability to translate non-USD BS | **Rate Fallback & Controller Escalation**: Deterministic fallback uses latest available period-average rate or prior-period spot rate, flags the line with a warning badge, and escalates to Treasury. |
| **5. Unbalanced Journal Entry ($\text{Dr} \neq \text{Cr}$)** | Corrupts post-adj ledger | **Deterministic Quarantine Gate**: Unbalanced entries (e.g., JE-002) are rejected immediately at the gate. Valid entries in the batch proceed, while bad entries are placed in quarantine with plain-English diagnostics. |
| **6. Circular Intercompany Entry (JE-008)** | Artificial volume inflation | **Cycle Detection**: The system identifies self-looping debit-credit allocations on the same account and alerts the controller to provide the true eliminating subsidiary counterparty. |
| **7. Ambiguous COA Category (e.g., 2190, 6800)** | Wrong Statement or Cash Flow classification | **Semantic Analysis & Disambiguation**: LLM evaluates account name and transaction history to suggest standard classification (e.g. 6800 Restructuring $\to$ OpEx, 2190 Other Accrued $\to$ Operating Cash Flow). |

---

## 5. Validation and Self-Correction Loop

Before any financial statement artifact is emitted, the **Dual-Loop Verification Engine** executes the following verification pipeline:

```
                  ┌─────────────────────────────────────┐
                  │    Post-Adjustment Ledger State     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
         ┌──────────────────────────────────────────────────────┐
         │     Loop 1: Deterministic Invariance Checkers        │
         │  1. Check ∑Debits = ∑Credits on Post-Adj TB         │
         │  2. Assets == Liabilities + Equity (Delta == $0.00)  │
         │  3. Net Income on P&L == Retained Earnings Roll-FWD  │
         │  4. CF Ending Cash == BS Cash & Cash Equivalents     │
         │  5. SOCIE Ending Equity == BS Total Equity           │
         └───────────────────────────┬──────────────────────────┘
                                     │
                   ┌─────────────────┴─────────────────┐
                   │ All Passed?                       │
            [ Yes ]│                            [ No ] │
                   ▼                                   ▼
┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
│ Loop 2: Semantic Plausibility Agent │ │ Automated Self-Correction Protocol: │
│ • Check gross margin within bounds  │ │ • Identify failing sub-ledger item  │
│ • Detect unusual negative balances  │ │ • Auto-quarantine violating JEs     │
│ • Validate comparative seasonality  │ │ • Re-run translation & aggregation  │
└──────────────────┬──────────────────┘ └──────────────────┬──────────────────┘
                   │                                       │
                   ▼                                       │
┌─────────────────────────────────────┐                    │
│ Certified Audit-Ready Statements    │◄───────────────────┘
└─────────────────────────────────────┘
```

---

## 6. Audit Traceability Architecture: Directed Acyclic Graph (DAG)

Every financial cell in our generated statement carries an immutable **Cryptographic Lineage Descriptor**:

```json
{
  "cellId": "BS-ASSET-1110",
  "statement": "BalanceSheet",
  "lineItem": "Cash and Cash Equivalents",
  "finalValueUSD": 6734340.00,
  "formula": "∑ Translated Raw TB + ∑ Manual Adjustments (JE-003)",
  "lineage": {
    "raw_sources": [
      { "id": "TB-ROW-1", "account": "1110", "ccy": "USD", "amount": 4850200.00, "fx": 1.0 },
      { "id": "TB-ROW-2", "account": "1110", "ccy": "EUR", "amount": 1250000.00, "fx": 1.053, "usd": 1316250.00 },
      { "id": "TB-ROW-3", "account": "1110", "ccy": "GBP", "amount": 420000.00, "fx": 1.258, "usd": 528360.00 },
      { "id": "TB-ROW-4", "account": "1110", "ccy": "USD", "amount": 50000.00, "fx": 1.0 }
    ],
    "adjustments_applied": [
      { "je_id": "JE-003", "type": "DEBIT", "amountUSD": 11200.00, "memo": "EUR cash uplift", "author": "FX reval calc" }
    ],
    "checksum": 6734340.00
  }
}
```

When an external auditor clicks any number on the Balance Sheet or P&L, the interface renders this exact DAG drill-down in real time, guaranteeing **Level-4 Audit Compliance**.
