# Autonomous Financial Reporting Agent — Section 4.2 Prototype (Slice 2 Flagship)

> **Submission for AI Agentic Engineer Take-Home Assignment**  
> **Candidate:** Prahlad Chauhan (`PRAHLAD786CHAUHAN@gmail.com`)  
> **Chosen Slice:** Slice 2 — Manual Adjustments Agent & Invariant Quarantine Desk  
> **Live Interactive App:** [https://erp-agentic-financial-reporting-workbench.ai.studio/](https://erp-agentic-financial-reporting-workbench.ai.studio/)

---

## 1. Executive Summary & Slice Selection

In strict compliance with **Section 4.2** of the assignment brief:
> *"Working prototype of **ONE slice** — Pick the slice you find most interesting and build it end-to-end. **Do not attempt all four.** We would rather see one slice done thoughtfully than four done shallowly."*

This repository delivers a comprehensive, end-to-end implementation of **Slice 2: Manual Adjustments Agent & Invariant Quarantine Desk**, backed by a deterministic accounting arithmetic engine and LLM-driven controller diagnostics.

### Key Highlights:
- **Zero Pre-Sanitization**: Ingests raw `manual_adjustments.json`, `trial_balance.csv`, `chart_of_accounts.csv`, `fx_rates.csv`, and `prior_period_tb.csv` as-is.
- **Deterministic Invariant Validation**: Mathematically verifies double-entry equality ($\sum \text{Debits} = \sum \text{Credits}$ to $\$0.001$), active COA taxonomy graph conformance, and circular intercompany DAG wash loops.
- **Plain-English Error Explainer**: Translates mathematical and schema failures into clear, controller-grade memos citing US GAAP (ASC 250, ASC 810, ASC 830) / IFRS standards.
- **Quarantine Isolation Gate**: Defective entries are held in a secure Quarantine Desk with 1-click remediation, preventing ledger contamination.
- **Audit-Grade Traceability**: Cell-level cryptographic SHA-256 DAG hash lineage tracing financial statement figures back to ERP source rows.

---

## 2. Seeded Defect Resolution Matrix (Slice 2)

| Entry ID | Defect in Raw Mock Data | Detection Mechanism | Plain-English Diagnostic & Action |
| :--- | :--- | :--- | :--- |
| **`JE-002`** | **Unbalanced Entry**: Debit $\$28,500 \neq$ Credit $\$25,000$ (Bonus Accrual). | Sum Invariant Engine ($\Delta = +\$3,500.00$) | *"Entry JE-002 violates fundamental double-entry balance: total debits exceed credits by $3,500.00. Entry quarantined to prevent Balance Sheet mismatch. Action: 1-click auto-balance credit to $28,500."* |
| **`JE-005`** | **Unmapped COA Code**: References non-existent account `6315` (Travel). | Taxonomy Graph Traversal | *"Account code 6315 does not exist in the active Chart of Accounts. Quarantined to prevent unclassified expense leakage. Action: 1-click semantic remap to parent account 6310 (SaaS & IT Expenses)."* |
| **`JE-008`** | **Circular IC Wash Loop**: Account `2170` loop between subsidiaries with zero external equity impact. | DAG Cycle & Wash Detector | *"Circular transfer detected on intercompany account 2170 without external equity impact. Quarantined to prevent double-counting in consolidation. Action: Isolate circular leg."* |
| **Valid (7)** | `JE-001`, `JE-003`, `JE-004`, `JE-006`, `JE-007`, `JE-009`, `JE-010` | Invariant Verification | Passed and posted cleanly into the General Ledger. |

---

## 3. The Deterministic vs. AI Boundary

| Layer | Responsibility | Technology Stack |
| :--- | :--- | :--- |
| **Arithmetic & Invariants** | Double-entry sum ($\sum D = \sum C$), statement rollups, $A = L + E$ equality. | Pure TypeScript Functional Reducers |
| **Taxonomy & Graph Logic** | Exact COA tree matching, Tarjan's DAG cycle detection. | Deterministic Graph Algorithms |
| **Diagnostic Explanations** | Translating validation errors into natural language accounting memos. | LLM Structured Output & Prompt Engine |
| **Semantic Mapping** | Cosine vector similarity between unmapped ERP account strings and COA hierarchy. | Vector Embeddings + Prefix Heuristics |
| **Audit Provenance** | Immutable cell-level hash lineage to raw ERP rows. | SHA-256 / Directed Acyclic Graphs |

---

## 4. How to Run Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

```bash
# 1. Clone repository
git clone <YOUR_REPO_URL>
cd financial-agent-prototype

# 2. Install dependencies
npm install

# 3. Start local development server (runs on http://localhost:3000)
npm run dev

# 4. Run type checks and linter
npm run lint

# 5. Build for production
npm run build
```

---

## 5. Repository Structure

```
├── docs/
│   ├── architecture.md            # Section 4.1 Architecture Document
│   └── reflection.md              # Section 4.3 One-Page Reflection & Clarifying Questions
├── output/                        # Section 7 Generated Output Artifacts
│   ├── balance_sheet.json         # Certified A = L + E Balance Sheet
│   ├── profit_and_loss.json       # P&L with Operating & Net Income
│   ├── cash_flow_statement.json   # Indirect Method Cash Flow Statement
│   ├── statement_of_equity.json   # SOCIE Equity Walk
│   ├── manual_adjustments_quarantine_report.json # Seeded defect audit logs
│   └── audit_lineage_trace.json   # Cell-level DAG provenance traces
├── src/
│   ├── components/
│   │   ├── AdjustmentsWorkbench.tsx # ⭐ Slice 2 Flagship: Adjustments & Quarantine Desk
│   │   ├── LocalFileImportModal.tsx # Local CSV/JSON File Importer (Drag & Drop)
│   │   ├── COAMapperWorkbench.tsx   # Slice 1: Semantic COA Mapper & HITL Desk
│   │   ├── StatementViewer.tsx      # Slice 3: 4-Financial Statements & Invariant Verifier
│   │   ├── ReconciliationDesk.tsx   # Slice 4: Pre vs Post TB Delta Explainer
│   │   ├── DataIngestionInspector.tsx # Raw data inspector & Google Sheets fetcher
│   │   ├── ArchitectureDocViewer.tsx# Embedded Section 4.1 Spec
│   │   └── ReflectionDocViewer.tsx  # Embedded Section 4.3 Reflection
│   ├── engine/
│   │   ├── accountingEngine.ts      # Pure deterministic accounting math & invariants
│   │   ├── manualAdjustmentsEngine.ts # Invariant validator & plain-English generator
│   │   └── parser.ts                # Robust CSV / JSON ingestion parsers
│   ├── types.ts                     # TypeScript schemas & audit trace types
│   └── App.tsx                      # Root application layout
├── package.json
└── README.md
```

---

## 6. Deliverable Compliance

- **4.1 Architecture Document**: Available in `/docs/architecture.md` and embedded in the app under the `📐 Architecture (4.1)` tab.
- **4.2 Working Prototype (Slice 2 Focus)**: Available in `/src/components/AdjustmentsWorkbench.tsx` and interactive in the app.
- **4.3 One-Page Reflection**: Available in `/docs/reflection.md` and embedded in the app under the `📝 Reflection (4.3)` tab.
- **7. Output Artifacts**: Available in `/output/`.
