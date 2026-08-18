import React, { useState } from 'react';
import { ChartOfAccountItem, MappingSuggestion } from '../types';
import { Network, CheckCircle, AlertCircle, Sparkles, ArrowRight, HelpCircle, ShieldCheck, UserCheck } from 'lucide-react';

interface COAMapperWorkbenchProps {
  coa: ChartOfAccountItem[];
  mappingSuggestions: MappingSuggestion[];
  onApplyMapping: (suggestion: MappingSuggestion) => void;
  onDiscardMapping?: (accountCode: string) => void;
  orphanOverrides: Record<string, string>;
}

export const COAMapperWorkbench: React.FC<COAMapperWorkbenchProps> = ({
  coa,
  mappingSuggestions,
  onApplyMapping,
  onDiscardMapping,
  orphanOverrides,
}) => {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>(mappingSuggestions[0]?.account_code || '1999');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSuggestion = mappingSuggestions.find((s) => s.account_code === selectedAccountCode) || mappingSuggestions[0];

  const ambiguousAccounts = coa.filter((c) => c.is_ambiguous);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Network className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                    Section 4.2 Prototype Candidate (Slice 1)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">Semantic COA Mapper & HITL Resolution Desk</h2>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl">
              Handles unmapped orphan accounts (e.g. Account 1999) from ERP trial balance feeds and ambiguous taxonomy nodes. Employs semantic embedding similarity + accounting heuristics with explicit confidence scores (0.94) and 1-click Human-In-The-Loop approval vs Suspense (9999) routing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-xs text-slate-400 font-medium">Orphans Pending</div>
              <div className="text-lg font-bold font-mono text-amber-400">
                {mappingSuggestions.filter((s) => !orphanOverrides[s.account_code]).length}
              </div>
            </div>
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-xs text-slate-400 font-medium">Ambiguous Nodes</div>
              <div className="text-lg font-bold font-mono text-indigo-400">{ambiguousAccounts.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Orphan Queue + Ambiguity Disambiguation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Orphan & Ambiguous Accounts */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Unmapped Orphan Accounts ({mappingSuggestions.length})
            </h3>

            <div className="space-y-2">
              {mappingSuggestions.map((item) => {
                const isSelected = item.account_code === selectedAccountCode;
                const isApproved = !!orphanOverrides[item.account_code];

                return (
                  <div
                    key={item.account_code}
                    onClick={() => setSelectedAccountCode(item.account_code)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                        : isApproved
                        ? 'bg-slate-900/90 border-emerald-900/40 hover:border-emerald-700/60'
                        : 'bg-slate-900/90 border-amber-900/40 hover:border-amber-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{item.account_code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {isApproved ? 'Mapped & Active' : 'Needs Review'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold font-mono text-blue-400">
                        <Sparkles className="w-3 h-3" />
                        <span>{(item.confidence * 100).toFixed(0)}% Match</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 font-medium line-clamp-1">{item.account_name}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Suggested Parent:</span>
                      <span className="font-mono text-slate-200 font-bold">{item.suggested_parent}</span>
                      <span>({item.suggested_statement})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ambiguous COA Nodes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Seeded Ambiguous COA Categories ({ambiguousAccounts.length})
            </h3>

            <div className="space-y-2">
              {ambiguousAccounts.map((item) => (
                <div key={item.account_code} className="p-3 rounded-xl bg-slate-900 border border-indigo-900/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">{item.account_code}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {item.cash_flow_category === 'Unassigned' ? 'Unassigned Cash Flow' : 'Defect Node'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{item.account_name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono italic">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Reasoning & 1-Click HITL Resolution */}
        <div className="lg:col-span-7">
          {activeSuggestion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">{activeSuggestion.account_code}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      AI Confidence: {(activeSuggestion.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 mt-1">{activeSuggestion.account_name}</h4>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Target Statement</span>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {activeSuggestion.suggested_statement === 'BS' ? 'Balance Sheet' : 'Profit & Loss'}
                  </div>
                </div>
              </div>

              {/* Semantic Recommendation Card */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Agentic Semantic Recommendation</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Parent Node</span>
                    <div className="font-bold text-white mt-0.5">{activeSuggestion.suggested_parent}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Account Type</span>
                    <div className="font-bold text-white mt-0.5">{activeSuggestion.suggested_type}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Cash Flow Cat</span>
                    <div className="font-bold text-white mt-0.5">{activeSuggestion.suggested_cash_flow}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase">Normal Bal</span>
                    <div className="font-bold text-white mt-0.5">Debit</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] font-bold text-indigo-300 mb-1">Reasoning & Accounting Rationale:</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeSuggestion.reasoning}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Status:{' '}
                  <span className="font-semibold text-slate-200">
                    {orphanOverrides[activeSuggestion.account_code]
                      ? `Mapped to node ${orphanOverrides[activeSuggestion.account_code]}`
                      : 'Pending Human-in-the-Loop Confirmation'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onDiscardMapping && (
                    <button
                      onClick={() => onDiscardMapping(activeSuggestion.account_code)}
                      className="px-3.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Route to Suspense (9999)</span>
                    </button>
                  )}

                  <button
                    onClick={() => onApplyMapping(activeSuggestion)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve & Map into Financials</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              Select an account to view semantic mapping suggestions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
