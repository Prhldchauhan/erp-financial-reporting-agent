# Section 4.1: Architecture Document — ERP-Driven Financial Reporting Agent

**Author:** Prahlad Chauhan (`PRAHLAD786CHAUHAN@gmail.com`)  
**Target:** AI Agentic Engineer Take-Home  
**Scope:** Production-Grade Agentic Architecture for Ingestion, Adjustments, and Financial Statement Generation

---

## 1. Agent Topology: Coordinated Multi-Agent Orchestrator

Rather than an unconstrained single monolithic prompt or an over-engineered 12-agent swarm, we employ a **Coordinated Multi-Agent Topology** managed by a Central Deterministic Orchestrator:

```
[Raw ERP Ingestion: TB, COA, Adjustments, FX]
                      │
                      ▼
       [Deterministic Ingestion Validator]
        ├── Currency & Rate Lookup
        └── Schema & Completeness Gate
                      │
     ┌────────────────┴────────────────┐
     ▼                                 ▼
[COA Mapper Agent (Slice 1)]   [Manual Adjustments Agent (Slice 2)]
 ├── Vector Cosine Similarity   ├── Double-Entry Invariant Gate (ΣD = ΣC)
 ├── Prefix Heuristic Rules     ├── COA Graph Conformance Check
 └── HITL Escalation Desk       ├── DAG Cycle / Wash Detector
                                └── Quarantine Desk & Plain-English Memos
     │                                 │
     └────────────────┬────────────────┘
                      │
                      ▼
     [Financial Statement Builder (Slice 3)]
      ├── Balance Sheet (A = L + E Check)
      ├── P&L Statement (Operating vs. Net Income)
      ├── Cash Flow Statement (Indirect Method)
      └── Statement of Changes in Equity (SOCIE)
                      │
                      ▼
    [Reconciliation & Lineage Explainer (Slice 4)]
      ├── Cryptographic SHA-256 DAG Audit Lineage
      └── Line-by-Line Pre vs. Post TB Attribution
```

### Why this topology was chosen:
- **Separation of Concerns**: Prevents errors in manual adjustments from corrupting COA classification.
- **Idempotency & Replayability**: Invariant gates are deterministic and can be evaluated in constant time ($O(N)$).
- **Graceful Degradation**: Defective entries are held in a Quarantine Desk without stopping the pipeline for valid entries.

---

## 2. Deterministic Code vs. LLM Reasoning Boundary

| Pipeline Operation | Deterministic Code (Zero Tolerance) | LLM Reasoning & Agentic Intelligence |
| :--- | :--- | :--- |
| **Arithmetic & Aggregations** | Summing debits/credits, subtotals, ratios, rounding | *Forbidden from calculating arithmetic or balances* |
| **Double-Entry Invariance** | Enforcing $\sum \text{Debits} - \sum \text{Credits} = 0$ | Explaining *why* an unbalanced entry failed and suggesting remediation |
| **COA Taxonomy Mapping** | Exact account code lookup & prefix matching | Semantic matching for renamed/ambiguous accounts with confidence scores |
| **Cycle & Circular Detection** | Tarjan's / DFS cycle detection on transaction graphs | Explaining economic substance of circular intercompany wash entries |
| **FX Translation** | Math multiplication via rate tables (Spot vs. Avg) | Recommending rate interpolation and flagging unhedged translation exposure |
| **Audit Traceability** | Cell-level DAG lineage, deterministic row hashes | Generating executive variance commentary and narrative footnotes |

---

## 3. Production Failure Mode Handling Matrix

1. **Unbalanced Adjustments (`JE-002`)**:
   - *Detection*: Invariant Engine catches Debit $\$28,500 \neq$ Credit $\$25,000$ ($\Delta = +\$3,500.00$).
   - *Action*: Quarantined immediately at entry gate. LLM generates controller memo citing ASC 250 with 1-click auto-balance option.
2. **Unmapped COA Accounts (`JE-005`)**:
   - *Detection*: Account `6315` not found in COA graph.
   - *Action*: Quarantined to prevent unclassified expense leakage. Vector similarity suggests remap to parent node `6310` (SaaS & IT Expenses) with 94% confidence.
3. **Circular Intercompany Wash Loops (`JE-008`)**:
   - *Detection*: DFS cycle detector catches circular transfer on account `2170` with zero external equity impact.
   - *Action*: Quarantined with plain-English explanation warning against consolidation inflation.
4. **FX Rounding Discrepancies**:
   - *Detection*: Trial balance imbalances due to rounding ($< \$50.00$).
   - *Action*: Isolated deterministically into Cumulative Translation Adjustment (CTA) in equity.

---

## 4. Self-Correction and Invariant Verification Loop

Before any statement is finalized or exported, the **Verification Engine** runs 4 non-negotiable invariant assertions:
1. **Balance Sheet Equation**: $\text{Total Assets} - (\text{Total Liabilities} + \text{Total Equity}) = 0.00$.
2. **Net Income Linkage**: P&L Net Income must equal the Net Income line item in the Equity Walk and Cash Flow Operating Activities.
3. **Ending Cash Consistency**: Cash on Balance Sheet must equal Ending Cash on the Cash Flow Statement.
4. **Quarantine Cleanliness**: Active general ledger must contain 0 unapproved or unbalanced journal entries.

---

## 5. Audit-Grade Traceability (Cell-Level Lineage)

Every cell on every financial statement links to a cryptographic SHA-256 DAG hash containing:
- ERP source export row identifier.
- Currency translation spot/average rate used.
- Specific manual journal adjustment IDs modifying the line, with controller sign-off timestamp.
