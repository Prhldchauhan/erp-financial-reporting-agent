import React from 'react';
import { ShieldCheck, Database, RefreshCw, Cpu, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBalanced: boolean;
  quarantinedCount: number;
  orphanCount: number;
  onResetData: () => void;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isBalanced,
  quarantinedCount,
  orphanCount,
  onResetData,
  onOpenImportModal,
}) => {
  const navTabs = [
    { id: 'adjustments', label: `⭐ Slice 2: Adjustments Agent (${quarantinedCount})` },
    { id: 'coa', label: `🗺️ Slice 1: COA Mapper (${orphanCount})` },
    { id: 'statements', label: '📊 Slice 3: Statements & Invariants' },
    { id: 'reconciliation', label: '🔍 Slice 4: TB Delta Recon' },
    { id: 'tour', label: '🚀 Full Walkthrough (1-7)' },
    { id: 'architecture', label: '📐 Architecture (4.1)' },
    { id: 'reflection', label: '📝 Reflection (4.3)' },
    { id: 'data', label: '📥 Raw Data & Ingestion' },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & System Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-inner">
              LA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  LedgerAgent
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    Enterprise ERP Engine
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Agentic Financial Reporting System • Period: <span className="text-slate-200 font-semibold">2024-Q4 (USD)</span>
              </p>
            </div>
          </div>

          {/* Engine Status Indicators */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 border font-medium ${
              isBalanced 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' 
                : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
            }`}>
              {isBalanced ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span>BS Equation: {isBalanced ? 'A = L + E' : 'Unbalanced'}</span>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quarantine Gate: {quarantinedCount} Isolated</span>
            </div>

            <button
              onClick={onOpenImportModal}
              className="px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 cursor-pointer font-medium bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm"
              title="Import local CSV / JSON files from your computer"
            >
              <Database className="w-3.5 h-3.5 text-blue-200" />
              <span>Import Local Files</span>
            </button>

            <button
              onClick={onResetData}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center gap-1 cursor-pointer font-medium"
              title="Reset to default mock dataset"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
