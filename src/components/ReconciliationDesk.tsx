import React, { useState } from 'react';
import { ChartOfAccountItem, ManualAdjustment, TranslatedTrialBalanceItem } from '../types';
import { Scale, ArrowRight, ArrowDownRight, ArrowUpRight, Search, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface ReconciliationDeskProps {
  coa: ChartOfAccountItem[];
  translatedTB: TranslatedTrialBalanceItem[];
  postAdjTB: Record<string, number>;
  adjustments: ManualAdjustment[];
}

export const ReconciliationDesk: React.FC<ReconciliationDeskProps> = ({
  coa,
  translatedTB,
  postAdjTB,
  adjustments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChangedOnly, setFilterChangedOnly] = useState(true);

  // Group Pre-Adjustment functional amounts by account_code
  const preAdjBalances: Record<string, number> = {};
  translatedTB.forEach((item) => {
    preAdjBalances[item.account_code] = (preAdjBalances[item.account_code] || 0) + item.net_functional;
  });

  const coaMap = new Map<string, ChartOfAccountItem>(coa.map((c) => [c.account_code, c]));
  const allAccountCodes = Array.from(new Set([...Object.keys(preAdjBalances), ...Object.keys(postAdjTB)]));

  const reconciliationRows = allAccountCodes.map((code) => {
    const coaItem = coaMap.get(code);
    const name = coaItem?.account_name || 'Orphan / Clearing Account';
    const preBal = Math.round((preAdjBalances[code] || 0) * 100) / 100;
    const postBal = Math.round((postAdjTB[code] || 0) * 100) / 100;
    const delta = Math.round((postBal - preBal) * 100) / 100;

    // Find adjustments impacting this code
    const impactingAdjs = adjustments
      .filter((a) => a.status === 'Accepted' && a.lines.some((l) => l.account === code))
      .map((a) => {
        const line = a.lines.find((l) => l.account === code)!;
        const lineAmt = line.debit > 0 ? `+Dr $${line.debit.toLocaleString()}` : `-Cr $${line.credit.toLocaleString()}`;
        return `${a.id} (${lineAmt}: ${line.memo || a.description})`;
      });

    let explanation = 'No manual adjustments applied in current period.';
    if (impactingAdjs.length > 0) {
      explanation = `Delta of $${Math.abs(delta).toLocaleString()} driven by: ${impactingAdjs.join('; ')}.`;
    }

    return {
      code,
      name,
      statement: coaItem?.statement || 'BS',
      preBal,
      postBal,
      delta,
      impactingAdjs,
      explanation,
    };
  });

  const filteredRows = reconciliationRows.filter((r) => {
    if (filterChangedOnly && r.delta === 0) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
    }
    return true;
  });

  const totalDeltaSum = filteredRows.reduce((s, r) => s + r.delta, 0);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold">
                    Section 4.2 Prototype Candidate (Slice 4)
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">Pre-Adjustment vs. Post-Adjustment Reconciliation Agent</h2>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl">
              Provides line-by-line audit reconciliation comparing raw ERP trial balance amounts against post-adjustment ledger balances across all 82 accounts. Explains the exact economic driver, journal entry lineage ID, and quarantine exclusions behind every delta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-xs text-slate-400 font-medium">Impacted Accounts</div>
              <div className="text-lg font-bold font-mono text-blue-400">
                {reconciliationRows.filter((r) => r.delta !== 0).length}
              </div>
            </div>
            <div className="bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-700 text-center">
              <div className="text-xs text-slate-400 font-medium">Net Delta Sum</div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                ${totalDeltaSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search account code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>

            <button
              onClick={() => setFilterChangedOnly(!filterChangedOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                filterChangedOnly
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {filterChangedOnly ? 'Showing Modified Accounts Only' : 'Showing All Accounts'}
            </button>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            Displaying {filteredRows.length} of {reconciliationRows.length} total accounts
          </span>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Account Code & Name</th>
                <th className="py-3 px-4">Stmt</th>
                <th className="py-3 px-4 text-right">Pre-Adj TB ($)</th>
                <th className="py-3 px-4 text-right">Post-Adj TB ($)</th>
                <th className="py-3 px-4 text-right">Delta ($)</th>
                <th className="py-3 px-4">Reconciliation Narrative & JE Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-sans">
              {filteredRows.map((r) => {
                const hasDelta = r.delta !== 0;

                return (
                  <tr key={r.code} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{r.code}</span>
                      </div>
                      <div className="text-slate-300 text-xs font-sans mt-0.5">{r.name}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {r.statement}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      ${r.preBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      ${r.postBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {hasDelta ? (
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            r.delta > 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {r.delta > 0 ? '+' : ''}
                          ${r.delta.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-slate-500">$0.00</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-300 max-w-md">
                      {hasDelta ? (
                        <div className="space-y-1">
                          <p className="text-slate-200 leading-snug">{r.explanation}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.impactingAdjs.map((adjStr, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800"
                              >
                                {adjStr}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No manual changes applied</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
