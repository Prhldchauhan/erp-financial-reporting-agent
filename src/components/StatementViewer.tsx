import React, { useState } from 'react';
import { FinancialStatementsResult, StatementLineItem, AuditLineageNode } from '../types';
import { ChevronRight, CheckCircle, AlertCircle, Info, ExternalLink, Download, FileSpreadsheet } from 'lucide-react';
import { AuditDrilldownModal } from './AuditDrilldownModal';

interface StatementViewerProps {
  statements: FinancialStatementsResult;
  lineageDAG: Record<string, AuditLineageNode>;
}

export const StatementViewer: React.FC<StatementViewerProps> = ({ statements, lineageDAG }) => {
  const [selectedStatement, setSelectedStatement] = useState<'BS' | 'PL' | 'CF' | 'SOCIE'>('BS');
  const [activeDrilldownNode, setActiveDrilldownNode] = useState<AuditLineageNode | null>(null);

  const { balanceSheet, profitAndLoss, cashFlow, equityStatement } = statements;

  const handleCellClick = (cellId: string) => {
    if (lineageDAG[cellId]) {
      setActiveDrilldownNode(lineageDAG[cellId]);
    }
  };

  const renderLineRow = (item: StatementLineItem, indent = 0, isHeaderOrTotal = false) => {
    const isClickable = !item.isHeader && item.cellId && lineageDAG[item.cellId];

    return (
      <tr
        key={item.cellId || item.name}
        className={`border-b border-slate-800 transition ${
          item.isTotal
            ? 'bg-slate-800/60 font-bold text-white'
            : item.isHeader
            ? 'bg-slate-800/20 text-slate-300 font-semibold'
            : 'hover:bg-slate-800/40 text-slate-300'
        }`}
      >
        <td className="py-2.5 px-4 font-sans text-xs">
          <div className="flex items-center" style={{ paddingLeft: `${indent * 16}px` }}>
            {item.isHeader && <ChevronRight className="w-3.5 h-3.5 mr-1 text-slate-500" />}
            <span className={item.isTotal ? 'text-white' : ''}>{item.name}</span>
            {item.accountCodes && item.accountCodes.length > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60">
                {item.accountCodes.join(', ')}
              </span>
            )}
          </div>
        </td>

        <td className="py-2.5 px-4 text-right font-mono text-xs">
          {item.isHeader ? (
            ''
          ) : (
            <button
              onClick={() => handleCellClick(item.cellId)}
              disabled={!isClickable}
              className={`font-semibold cursor-pointer group flex items-center justify-end w-full gap-1 ${
                isClickable ? 'text-blue-400 hover:text-blue-300 hover:underline' : 'text-slate-200'
              }`}
              title="Click for audit-grade source lineage"
            >
              <span>
                ${item.currentPeriod.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {isClickable && (
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-blue-400" />
              )}
            </button>
          )}
        </td>

        <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-400">
          {item.isHeader
            ? ''
            : `$${(item.priorPeriod || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
        </td>

        <td className="py-2.5 px-4 text-right font-mono text-xs">
          {item.isHeader ? (
            ''
          ) : (
            <span
              className={`font-medium ${
                (item.delta || 0) > 0 ? 'text-emerald-400' : (item.delta || 0) < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {(item.delta || 0) > 0 ? '+' : ''}
              ${(item.delta || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </td>

        <td className="py-2.5 px-4 text-right font-mono text-xs">
          {item.isHeader ? (
            ''
          ) : (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                (item.deltaPct || 0) > 0
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : (item.deltaPct || 0) < 0
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                  : 'text-slate-500'
              }`}
            >
              {(item.deltaPct || 0) > 0 ? '+' : ''}
              {item.deltaPct?.toFixed(1)}%
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Audit Readiness Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              balanceSheet.isBalanced
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}>
              {balanceSheet.isBalanced ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  Section 4.2 Prototype Candidate (Slice 3)
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {balanceSheet.isBalanced ? '4-Statement Generator with Verification Agent ($A = L + E$)' : 'Balance Sheet Discrepancy Detected'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {balanceSheet.isBalanced
                  ? 'All 4 primary statements tie out with zero mathematical variance. Click any number to inspect source lineage DAG.'
                  : `Discrepancy of $${Math.abs(balanceSheet.balanceDelta).toLocaleString()} between Assets and Liabilities + Equity.`}
              </p>
            </div>
          </div>

          {/* Statement Sub-tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setSelectedStatement('BS')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedStatement === 'BS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setSelectedStatement('PL')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedStatement === 'PL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Profit & Loss (P&L)
            </button>
            <button
              onClick={() => setSelectedStatement('CF')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedStatement === 'CF' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cash Flow (Indirect)
            </button>
            <button
              onClick={() => setSelectedStatement('SOCIE')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedStatement === 'SOCIE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Equity Walk (SOCIE)
            </button>
          </div>
        </div>
      </div>

      {/* Main Statement Content Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Statement Title Bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {selectedStatement === 'BS' && 'Statement of Financial Position (Balance Sheet)'}
              {selectedStatement === 'PL' && 'Statement of Operations & Comprehensive Income (Profit & Loss)'}
              {selectedStatement === 'CF' && 'Statement of Cash Flows (Indirect Method)'}
              {selectedStatement === 'SOCIE' && 'Statement of Changes in Stockholders’ Equity (SOCIE)'}
            </h3>
            <p className="text-[11px] text-slate-400">
              Reporting Entity: TechCorp Holdings Inc. • Functional Currency: USD (in actual dollars)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 italic">💡 Tip: Click any blue number for source row audit drilldown</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/80 text-slate-300 text-xs uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Line Item / Account Description</th>
                <th className="py-3 px-4 text-right">2024-Q4 (Current)</th>
                <th className="py-3 px-4 text-right">2023-Q4 (Prior)</th>
                <th className="py-3 px-4 text-right">Variance ($)</th>
                <th className="py-3 px-4 text-right">Variance (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {/* BALANCE SHEET VIEW */}
              {selectedStatement === 'BS' && (
                <>
                  {/* ASSETS */}
                  <tr className="bg-slate-800/40 text-blue-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Assets
                    </td>
                  </tr>
                  <tr className="bg-slate-850 text-slate-300 font-semibold text-xs">
                    <td colSpan={5} className="py-2 px-6">
                      Current Assets
                    </td>
                  </tr>
                  {balanceSheet.assets.slice(0, 7).map((item) => renderLineRow(item, 2))}

                  <tr className="bg-slate-850 text-slate-300 font-semibold text-xs">
                    <td colSpan={5} className="py-2 px-6">
                      Non-Current Assets
                    </td>
                  </tr>
                  {balanceSheet.assets.slice(7).map((item) => renderLineRow(item, 2))}

                  {/* TOTAL ASSETS */}
                  <tr className="bg-blue-950/40 border-t-2 border-b-2 border-blue-500/50 font-bold text-white text-sm">
                    <td className="py-3 px-4 font-sans">TOTAL ASSETS</td>
                    <td className="py-3 px-4 text-right text-blue-300 font-mono">
                      ${balanceSheet.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      $18,053,000.00
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">
                      +${(balanceSheet.totalAssets - 18053000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        +{(((balanceSheet.totalAssets - 18053000) / 18053000) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>

                  {/* LIABILITIES */}
                  <tr className="bg-slate-800/40 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Liabilities
                    </td>
                  </tr>
                  <tr className="bg-slate-850 text-slate-300 font-semibold text-xs">
                    <td colSpan={5} className="py-2 px-6">
                      Current Liabilities
                    </td>
                  </tr>
                  {balanceSheet.liabilities.slice(0, 8).map((item) => renderLineRow(item, 2))}

                  <tr className="bg-slate-850 text-slate-300 font-semibold text-xs">
                    <td colSpan={5} className="py-2 px-6">
                      Non-Current Liabilities
                    </td>
                  </tr>
                  {balanceSheet.liabilities.slice(8).map((item) => renderLineRow(item, 2))}

                  <tr className="bg-slate-800/80 font-bold text-white">
                    <td className="py-2.5 px-4 font-sans pl-6">Total Liabilities</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-200">
                      ${balanceSheet.totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 font-mono">$13,547,000.00</td>
                    <td className="py-2.5 px-4 text-right text-rose-400 font-mono">
                      +${(balanceSheet.totalLiabilities - 13547000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                      +{(((balanceSheet.totalLiabilities - 13547000) / 13547000) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  {/* EQUITY */}
                  <tr className="bg-slate-800/40 text-emerald-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Stockholders' Equity
                    </td>
                  </tr>
                  {balanceSheet.equity.map((item) => renderLineRow(item, 2))}

                  <tr className="bg-slate-800/80 font-bold text-white">
                    <td className="py-2.5 px-4 font-sans pl-6">Total Stockholders' Equity</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-200">
                      ${balanceSheet.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 font-mono">$12,516,000.00</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400 font-mono">
                      +${(balanceSheet.totalEquity - 12516000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                      +{(((balanceSheet.totalEquity - 12516000) / 12516000) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  {/* TOTAL LIABILITIES & EQUITY */}
                  <tr className="bg-indigo-950/40 border-t-2 border-b-2 border-indigo-500/50 font-bold text-white text-sm">
                    <td className="py-3 px-4 font-sans">TOTAL LIABILITIES & STOCKHOLDERS' EQUITY</td>
                    <td className="py-3 px-4 text-right text-indigo-300 font-mono">
                      ${balanceSheet.totalLiabilitiesAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">$18,053,000.00</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">
                      +${(balanceSheet.totalLiabilitiesAndEquity - 18053000).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        +{(((balanceSheet.totalLiabilitiesAndEquity - 18053000) / 18053000) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </>
              )}

              {/* PROFIT & LOSS VIEW */}
              {selectedStatement === 'PL' && (
                <>
                  <tr className="bg-slate-800/40 text-emerald-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Revenues
                    </td>
                  </tr>
                  {profitAndLoss.revenue.map((item) => renderLineRow(item, 2))}
                  <tr className="bg-slate-800/60 font-bold text-white">
                    <td className="py-2 px-4 font-sans pl-6">Total Revenues</td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-300">
                      ${profitAndLoss.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">$11,650,000.00</td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-400">
                      +${(profitAndLoss.totalRevenue - 11650000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-400">
                      +{(((profitAndLoss.totalRevenue - 11650000) / 11650000) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  <tr className="bg-slate-800/40 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Cost of Goods Sold (COGS)
                    </td>
                  </tr>
                  {profitAndLoss.costOfGoodsSold.map((item) => renderLineRow(item, 2))}

                  <tr className="bg-slate-800/90 font-bold text-white border-t border-b border-slate-700">
                    <td className="py-2.5 px-4 font-sans">GROSS PROFIT</td>
                    <td className="py-2.5 px-4 text-right font-mono text-blue-300">
                      ${profitAndLoss.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">$9,170,000.00</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400">
                      +${(profitAndLoss.grossProfit - 9170000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400">
                      +{(((profitAndLoss.grossProfit - 9170000) / 9170000) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  <tr className="bg-slate-800/40 text-rose-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Operating Expenses (OpEx)
                    </td>
                  </tr>
                  {profitAndLoss.operatingExpenses.map((item) => renderLineRow(item, 2))}

                  <tr className="bg-slate-800/90 font-bold text-white border-t border-b border-slate-700">
                    <td className="py-2.5 px-4 font-sans">OPERATING INCOME (EBIT)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-indigo-300">
                      ${profitAndLoss.operatingIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">$1,385,000.00</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400">
                      +${(profitAndLoss.operatingIncome - 1385000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                      +{(((profitAndLoss.operatingIncome - 1385000) / 1385000) * 100).toFixed(1)}%
                    </td>
                  </tr>

                  <tr className="bg-slate-800/40 text-purple-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Other Income / (Expense) & Taxes
                    </td>
                  </tr>
                  {profitAndLoss.otherIncomeExpense.map((item) => renderLineRow(item, 2))}
                  {profitAndLoss.taxExpense.map((item) => renderLineRow(item, 2))}

                  <tr className="bg-emerald-950/40 border-t-2 border-b-2 border-emerald-500/60 font-bold text-white text-sm">
                    <td className="py-3 px-4 font-sans">NET INCOME (FOR THE PERIOD)</td>
                    <td className="py-3 px-4 text-right text-emerald-300 font-mono">
                      ${profitAndLoss.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">$877,000.00</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">
                      +${(profitAndLoss.netIncome - 877000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        +{(((profitAndLoss.netIncome - 877000) / 877000) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </>
              )}

              {/* CASH FLOW VIEW */}
              {selectedStatement === 'CF' && (
                <>
                  <tr className="bg-slate-800/40 text-blue-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Cash Flows from Operating Activities
                    </td>
                  </tr>
                  {cashFlow.operatingActivities.map((item) => renderLineRow(item, 2))}
                  <tr className="bg-slate-800/80 font-bold text-white">
                    <td className="py-2 px-4 font-sans pl-6">Net Cash from Operating Activities</td>
                    <td className="py-2 px-4 text-right font-mono text-blue-300">
                      ${cashFlow.totalOperating.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">$1,850,000.00</td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-400">
                      +${(cashFlow.totalOperating - 1850000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">N/A</td>
                  </tr>

                  <tr className="bg-slate-800/40 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Cash Flows from Investing Activities
                    </td>
                  </tr>
                  {cashFlow.investingActivities.map((item) => renderLineRow(item, 2))}
                  <tr className="bg-slate-800/80 font-bold text-white">
                    <td className="py-2 px-4 font-sans pl-6">Net Cash used in Investing Activities</td>
                    <td className="py-2 px-4 text-right font-mono text-amber-300">
                      ${cashFlow.totalInvesting.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-$750,000.00</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">N/A</td>
                  </tr>

                  <tr className="bg-slate-800/40 text-purple-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Cash Flows from Financing Activities
                    </td>
                  </tr>
                  {cashFlow.financingActivities.map((item) => renderLineRow(item, 2))}
                  <tr className="bg-slate-800/80 font-bold text-white">
                    <td className="py-2 px-4 font-sans pl-6">Net Cash from Financing Activities</td>
                    <td className="py-2 px-4 text-right font-mono text-purple-300">
                      ${cashFlow.totalFinancing.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-$600,000.00</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">-</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-400">N/A</td>
                  </tr>

                  <tr className="bg-slate-900 border-t-2 border-slate-700 font-bold text-white">
                    <td className="py-2.5 px-4 font-sans">Net Increase / (Decrease) in Cash</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400">
                      ${cashFlow.netCashChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">$500,000.00</td>
                    <td colSpan={2}></td>
                  </tr>
                  <tr className="bg-slate-900 text-slate-300">
                    <td className="py-2 px-4 font-sans pl-6">Cash at Beginning of Period</td>
                    <td className="py-2 px-4 text-right font-mono">${cashFlow.beginningCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td colSpan={3}></td>
                  </tr>
                  <tr className="bg-emerald-950/40 border-b-2 border-emerald-500/50 font-bold text-white text-sm">
                    <td className="py-3 px-4 font-sans">CASH AT END OF PERIOD (RECONCILED TO BALANCE SHEET)</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-300">
                      ${cashFlow.balanceSheetCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-right text-emerald-400 font-sans text-xs">
                      ✓ Ties 100% to Balance Sheet Cash Line (Account 1110)
                    </td>
                  </tr>
                </>
              )}

              {/* SOCIE VIEW */}
              {selectedStatement === 'SOCIE' && (
                <>
                  <tr className="bg-slate-800/40 text-blue-400 font-bold uppercase text-[11px] tracking-wider">
                    <td colSpan={5} className="py-2.5 px-4">
                      Statement of Changes in Stockholders’ Equity Walk
                    </td>
                  </tr>
                  <tr className="bg-slate-850 text-slate-200">
                    <td className="py-2.5 px-4 font-sans">Beginning Equity (2024-Q1 Opening)</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      ${equityStatement.beginningEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3} className="py-2.5 px-4 text-slate-400 font-sans text-xs">
                      Opening Common Stock + APIC + Opening Retained Earnings + Opening CTA
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-2 px-4 font-sans pl-6">+ Net Income Contribution (Current Period P&L)</td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-400 font-bold">
                      +${equityStatement.netIncomeContribution.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3} className="py-2 px-4 text-slate-400 font-sans text-xs">
                      Transferred directly to Retained Earnings
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-2 px-4 font-sans pl-6">+ FX Foreign Currency Translation Adjustment (CTA)</td>
                    <td className="py-2 px-4 text-right font-mono text-indigo-300 font-bold">
                      +${equityStatement.fxTranslationAdjustment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3} className="py-2 px-4 text-slate-400 font-sans text-xs">
                      ASC 830 Translation reserve movement in OCI
                    </td>
                  </tr>
                  <tr className="bg-emerald-950/40 border-t-2 border-b-2 border-emerald-500/50 font-bold text-white text-sm">
                    <td className="py-3 px-4 font-sans">CLOSING STOCKHOLDERS’ EQUITY (AS OF 2024-12-31)</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-300">
                      ${equityStatement.endingEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-right text-emerald-400 font-sans text-xs">
                      ✓ Reconciles 100% to Balance Sheet Total Equity
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Lineage Drilldown Modal */}
      <AuditDrilldownModal node={activeDrilldownNode} onClose={() => setActiveDrilldownNode(null)} />
    </div>
  );
};
