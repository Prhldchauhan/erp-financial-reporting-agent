import React, { useState } from 'react';
import { ManualAdjustment } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Wrench,
  ArrowRight,
  Info,
} from 'lucide-react';

interface AdjustmentsWorkbenchProps {
  adjustments: ManualAdjustment[];
  onUpdateAdjustment: (updated: ManualAdjustment) => void;
  onRemediateEntry: (id: string, actionType: 'balance_debit' | 'remap_account' | 'fix_ic' | 'discard') => void;
}

export const AdjustmentsWorkbench: React.FC<AdjustmentsWorkbenchProps> = ({
  adjustments,
  onUpdateAdjustment,
  onRemediateEntry,
}) => {
  const [selectedId, setSelectedId] = useState<string>(adjustments[1]?.id || adjustments[0]?.id);
  const [filter, setFilter] = useState<'ALL' | 'QUARANTINED' | 'ACCEPTED'>('ALL');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const filteredAdjustments = adjustments.filter((a) => {
    if (filter === 'QUARANTINED') return a.status === 'Quarantined';
    if (filter === 'ACCEPTED') return a.status === 'Accepted';
    return true;
  });

  const activeEntry = adjustments.find((a) => a.id === selectedId) || adjustments[0];

  const handleAskAI = async (adj: ManualAdjustment) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/explain-adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustment: adj,
          coaSummary: 'Standard COA with 1000s Assets, 2000s Liab, 6000s OpEx',
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        onUpdateAdjustment({
          ...adj,
          ai_explanation: data.explanation,
          remediation_suggestion: data.remediation || adj.remediation_suggestion,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const quarantinedCount = adjustments.filter((a) => a.status === 'Quarantined').length;
  const acceptedCount = adjustments.filter((a) => a.status === 'Accepted').length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                    Section 4.2 Prototype Candidate (⭐ Primary Flagship)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">Manual Adjustments & Quarantine Agent</h2>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl">
              Inspects all 10 unposted period-end journal entries against strict double-entry invariants (<span className="text-indigo-300 font-mono font-semibold">∑ Debits = ∑ Credits</span>), Chart of Accounts validity, and circular intercompany checks. Defective entries are quarantined to protect financial statement integrity, with plain-English finance explanations and 1-click remediation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-xs text-slate-400 font-medium">Quarantined</div>
              <div className="text-lg font-bold font-mono text-rose-400">{quarantinedCount}</div>
            </div>
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-xs text-slate-400 font-medium">Accepted</div>
              <div className="text-lg font-bold font-mono text-emerald-400">{acceptedCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Filter Batch:</span>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Entries ({adjustments.length})
          </button>
          <button
            onClick={() => setFilter('QUARANTINED')}
            className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
              filter === 'QUARANTINED'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            Quarantined Violations ({quarantinedCount})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
              filter === 'ACCEPTED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-emerald-300 hover:bg-emerald-950/40'
            }`}
          >
            Valid Entries ({acceptedCount})
          </button>
        </div>
      </div>

      {/* Main Split Workbench: Master List vs Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Master Entries List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Unposted Journal Entries ({filteredAdjustments.length})
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredAdjustments.map((adj) => {
              const isSelected = adj.id === selectedId;
              const isQuarantined = adj.status === 'Quarantined';
              const totalDebits = adj.lines.reduce((s, l) => s + l.debit, 0);

              return (
                <div
                  key={adj.id}
                  onClick={() => setSelectedId(adj.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                      : isQuarantined
                      ? 'bg-slate-900/90 border-rose-900/50 hover:border-rose-700/60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{adj.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isQuarantined
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1'
                        }`}
                      >
                        {isQuarantined ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {adj.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-300">
                      ${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium line-clamp-1">{adj.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>{adj.source}</span>
                    <span className="font-mono text-[10px]">{adj.date}</span>
                  </div>

                  {isQuarantined && adj.validation_errors.length > 0 && (
                    <div className="mt-2 text-[11px] text-rose-400 font-medium flex items-center gap-1 bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span className="line-clamp-1">{adj.validation_errors[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Diagnostic & Remediation Desk */}
        <div className="lg:col-span-7">
          {activeEntry ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-white font-mono">{activeEntry.id}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        activeEntry.status === 'Quarantined'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {activeEntry.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 mt-1">{activeEntry.description}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Source: <span className="text-slate-300">{activeEntry.source}</span> • Date: {activeEntry.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAskAI(activeEntry)}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{aiLoading ? 'Analyzing...' : 'AI Controller Insight'}</span>
                  </button>
                </div>
              </div>

              {/* Journal Entry Lines Table */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Journal Entry Distribution Lines
                </h5>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                      <tr>
                        <th className="p-2.5">Account Code</th>
                        <th className="p-2.5">Line Memo</th>
                        <th className="p-2.5 text-right">Debit ($)</th>
                        <th className="p-2.5 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                      {activeEntry.lines.map((l, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                            <span>{l.account}</span>
                            {l.account === '6315' && (
                              <span className="px-1 py-0.2 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-800">
                                Missing COA
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-300 font-sans text-xs">{l.memo}</td>
                          <td className="p-2.5 text-right text-slate-200">
                            {l.debit > 0 ? `$${l.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="p-2.5 text-right text-slate-200">
                            {l.credit > 0 ? `$${l.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-800/80 font-bold border-t border-slate-700 text-xs">
                      <tr>
                        <td colSpan={2} className="p-2.5 font-sans">
                          Batch Checksum Totals
                        </td>
                        <td className="p-2.5 text-right text-blue-300">
                          ${activeEntry.lines.reduce((s, l) => s + l.debit, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right text-blue-300">
                          ${activeEntry.lines.reduce((s, l) => s + l.credit, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Invariant Failure Diagnostics (If Quarantined) */}
              {activeEntry.status === 'Quarantined' && (
                <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Double-Entry Invariant Violation Detected</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-rose-200 list-disc list-inside">
                    {activeEntry.validation_errors.map((err, idx) => (
                      <li key={idx} className="font-mono">
                        {err}
                      </li>
                    ))}
                  </ul>

                  {/* AI Explanation in Plain English */}
                  {activeEntry.ai_explanation && (
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-rose-900/60 mt-2">
                      <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Plain-English Controller Diagnostic
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{activeEntry.ai_explanation}</p>
                    </div>
                  )}

                  {/* Interactive Remediation Actions */}
                  {activeEntry.remediation_suggestion && (
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700 mt-2">
                      <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                        <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        Recommended Remediation Strategy
                      </div>
                      <p className="text-xs text-slate-300 mb-3">{activeEntry.remediation_suggestion}</p>

                      {/* 1-Click Action Buttons for Seeded Defects */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                        {activeEntry.id === 'JE-002' && (
                          <button
                            onClick={() => onRemediateEntry('JE-002', 'balance_debit')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>1-Click Fix: Balance Credit to $28,500</span>
                          </button>
                        )}

                        {activeEntry.id === 'JE-005' && (
                          <button
                            onClick={() => onRemediateEntry('JE-005', 'remap_account')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>1-Click Fix: Remap Account 6315 $\to$ 6310 (T&E)</span>
                          </button>
                        )}

                        {activeEntry.id === 'JE-008' && (
                          <button
                            onClick={() => onRemediateEntry('JE-008', 'fix_ic')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>1-Click Fix: Break Circular Wash & Cancel Entry</span>
                          </button>
                        )}

                        <button
                          onClick={() => onRemediateEntry(activeEntry.id, 'discard')}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>1-Click: Discard & Quarantine</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateAdjustment({
                              ...activeEntry,
                              status: activeEntry.status === 'Quarantined' ? 'Accepted' : 'Quarantined',
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                        >
                          {activeEntry.status === 'Quarantined' ? 'Manual Override (Force Accept)' : 'Move to Quarantine'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Valid Entry Details */}
              {activeEntry.status === 'Accepted' && (
                <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Invariance & COA Checks Passed</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    This adjustment is balanced (Debits = Credits = $
                    {activeEntry.lines.reduce((s, l) => s + l.debit, 0).toLocaleString()}) and all referenced account codes exist in the Chart of Accounts. It has been applied to the post-adjustment trial balance.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              Select an adjustment from the list to view diagnostic audit details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
