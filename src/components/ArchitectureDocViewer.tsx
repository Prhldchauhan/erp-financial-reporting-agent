import React, { useState } from 'react';
import { Copy, Check, FileText, Download, ShieldCheck, Layers, Cpu, Database } from 'lucide-react';

interface ArchitectureDocViewerProps {
  content: string;
}

export const ArchitectureDocViewer: React.FC<ArchitectureDocViewerProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ARCHITECTURE.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Section 4.1: Architecture Document</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Complete architectural specification for the enterprise financial statement agentic engine: Agent Topology, Deterministic vs LLM boundary, Production failure-mode handling matrix, Verification loop, and Cryptographic DAG lineage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download ARCHITECTURE.md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Rendered Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-lg text-slate-200">
        <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-6">
          {/* Section 1 */}
          <div className="border-b border-slate-800 pb-5">
            <h1 className="text-xl font-bold text-white mb-2">AI Agentic Architecture Document</h1>
            <p className="text-sm font-semibold text-blue-400">
              System Name: LedgerAgent (Autonomous Financial Statement Generation & Audit Governance Platform)
            </p>
            <p className="text-xs text-slate-400">
              Ingestion: NetSuite / SAP Trial Balances, Hierarchical COA, Multi-Currency FX, Journal Adjustments
            </p>
          </div>

          {/* Core Principle Callout */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/40 text-blue-200">
            <div className="font-bold text-xs uppercase tracking-wider mb-1 text-blue-300">
              Core Architectural Directive
            </div>
            <p className="text-xs italic leading-relaxed">
              "Deterministic code acts as the immutable ledger and mathematical guardian; LLM agents act as semantic analysts, anomaly interpreters, and human-in-the-loop escalators. An LLM must NEVER perform double-entry arithmetic."
            </p>
          </div>

          {/* Section 2: Topology */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Agent Topology & Orchestration Pattern</h2>
            <p className="text-xs text-slate-300">
              We implement a <strong>Hierarchical Orchestrator with 4 Specialized Sub-Agents</strong> rather than an unstructured swarm or single agent. This guarantees deterministic state transitions and strict privilege boundaries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="font-bold text-white text-xs mb-1">1. Ingestion & FX Validator</div>
                <p className="text-slate-400 text-xs">
                  Parses multi-currency rows, detects duplicated code tuples, checks FX spot/average rates, and handles CAD/EUR/GBP conversion.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="font-bold text-white text-xs mb-1">2. Semantic COA Mapper</div>
                <p className="text-slate-400 text-xs">
                  Computes semantic embedding similarity, proposes parent-child taxonomy nodes, generates confidence scores, and escalates when confidence &lt; 90%.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="font-bold text-white text-xs mb-1">3. Journal Adjustment Agent</div>
                <p className="text-slate-400 text-xs">
                  Validates double-entry invariants (Sum of Debits = Sum of Credits), enforces COA membership, flags circular IC loops, and quarantines bad JEs with plain-English diagnostics.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <div className="font-bold text-white text-xs mb-1">4. Statement Builder & Verification Agent</div>
                <p className="text-slate-400 text-xs">
                  Runs deterministic rollups for BS, P&L, Indirect Cash Flow, and SOCIE; verifies Assets = Liabilities + Equity, CF ending cash, and emits cryptographic DAG lineage.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Deterministic Boundary */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Deterministic Code vs. LLM Reasoning Boundary</h2>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                  <tr>
                    <th className="p-2.5">Pipeline Function</th>
                    <th className="p-2.5">Deterministic Code (Strict)</th>
                    <th className="p-2.5 text-blue-300">LLM Reasoning & Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-sans">
                  <tr>
                    <td className="p-2.5 font-bold font-mono">Arithmetic & Rollups</td>
                    <td className="p-2.5 text-emerald-400 font-mono">100% Deterministic O(N) math</td>
                    <td className="p-2.5 text-rose-400 italic">Strictly forbidden from calculating sums</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-mono">Double-Entry Check</td>
                    <td className="p-2.5 font-mono">Enforces Debits - Credits = 0</td>
                    <td className="p-2.5">Generates plain-English controller diagnostic</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-mono">COA Mapping</td>
                    <td className="p-2.5 font-mono">Exact code lookup</td>
                    <td className="p-2.5">Semantic embeddings + confidence score</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-mono">Audit Traceability</td>
                    <td className="p-2.5 font-mono">Cryptographic DAG hash lineage</td>
                    <td className="p-2.5">Synthesizes executive variance narratives</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Failure Modes */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Failure Modes Handling in Production</h2>
            <ul className="space-y-2 text-slate-300 text-xs list-disc list-inside">
              <li>
                <strong>Unbalanced TB after FX rounding</strong>: Small residuals ($&lt; \$50.00$) isolated deterministically into Cumulative Translation Adjustment (CTA) in equity with audit log.
              </li>
              <li>
                <strong>Duplicate account code in raw TB</strong>: Detects collision; aggregates if split across currencies, halts if conflicting in functional currency.
              </li>
              <li>
                <strong>Orphan account not in COA</strong>: Routed to Suspense Clearing node; AI suggests parent node with 1-click HITL controller approval.
              </li>
              <li>
                <strong>Unbalanced Journal Entry (JE-002)</strong>: Isolated at quarantine gate; valid batch entries proceed without ledger corruption.
              </li>
              <li>
                <strong>Circular Intercompany Entry (JE-008)</strong>: Flagged by transaction cycle detector and quarantined with plain-English explanation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
