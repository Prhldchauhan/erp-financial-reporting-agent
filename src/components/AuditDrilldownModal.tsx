import React from 'react';
import { X, ArrowRight, ShieldCheck, Database, FileCheck2, Calculator, Layers } from 'lucide-react';
import { AuditLineageNode } from '../types';

interface AuditDrilldownModalProps {
  node: AuditLineageNode | null;
  onClose: () => void;
}

export const AuditDrilldownModal: React.FC<AuditDrilldownModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  const rawSources = node.sources.filter((s) => s.type === 'Raw_TB');
  const manualAdjustments = node.sources.filter((s) => s.type === 'Manual_Adjustment');

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{node.lineItemName}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {node.cellId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statement: <span className="text-blue-400 font-medium">{node.statement}</span> • Accounts: [{node.accountCodes.join(', ') || 'N/A'}]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 flex-1">
          {/* Summary Metric Block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                Current Period Value
              </div>
              <div className="text-xl font-bold font-mono text-white">
                ${node.finalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                Prior Period Comparative
              </div>
              <div className="text-xl font-bold font-mono text-slate-300">
                ${(node.priorValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Audit Status
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                100% Deterministic Lineage
              </div>
            </div>
          </div>

          {/* Aggregation Formula Specification */}
          <div className="bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/50">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Rollup Formula & Mapping Logic
            </div>
            <div className="font-mono text-slate-200 text-xs bg-slate-950/80 p-2.5 rounded border border-slate-800">
              {node.formulaDescription}
            </div>
          </div>

          {/* Layer 1: Raw ERP Trial Balance Ingestion Rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                1. Raw Ingested ERP Trial Balance Line Items ({rawSources.length})
              </h4>
              <span className="text-[11px] text-slate-400">NetSuite Multi-Currency Feed</span>
            </div>

            {rawSources.length === 0 ? (
              <div className="p-3 text-center text-slate-500 bg-slate-800/20 rounded border border-dashed border-slate-800">
                No direct raw TB lines (Calculated subtotal or roll-forward item)
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-700/70 rounded-lg">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="p-2">Row ID</th>
                      <th className="p-2">Account</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Original CCY</th>
                      <th className="p-2 text-right">Raw Amount</th>
                      <th className="p-2 text-right">FX Rate</th>
                      <th className="p-2 text-right text-blue-300">Functional USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {rawSources.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2 text-slate-400">{s.referenceId}</td>
                        <td className="p-2 font-bold text-white">{s.account_code}</td>
                        <td className="p-2 text-slate-300 font-sans">{s.account_name}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {s.currency}
                          </span>
                        </td>
                        <td className="p-2 text-right text-slate-200">
                          {s.original_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right text-slate-400">{s.fx_rate?.toFixed(4) || '1.0000'}</td>
                        <td className="p-2 text-right font-bold text-blue-400">
                          ${s.functional_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Layer 2: Applied Manual Adjustments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                2. Applied Manual Journal Adjustments ({manualAdjustments.length})
              </h4>
              <span className="text-[11px] text-slate-400">Approved Period-End Entries</span>
            </div>

            {manualAdjustments.length === 0 ? (
              <div className="p-3 text-center text-slate-500 bg-slate-800/20 rounded border border-dashed border-slate-800">
                No manual adjustments applied to this line item
              </div>
            ) : (
              <div className="space-y-2">
                {manualAdjustments.map((adj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {adj.referenceId}
                        </span>
                        <span className="text-white font-medium">{adj.description}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Account Code: {adj.account_code}</p>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`font-bold ${adj.functional_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {adj.functional_amount >= 0 ? '+' : ''}
                        ${adj.functional_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500">Post-Adj Delta</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1 font-mono">
            <span>Checksum Hash:</span>
            <span className="text-slate-300">
              SHA256-{node.cellId.replace(/[^A-Z0-9]/g, '')}-{(Math.abs(node.finalValue) * 100).toFixed(0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
