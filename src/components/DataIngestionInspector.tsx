import React, { useState } from 'react';
import {
  RAW_COA_CSV,
  RAW_TB_CSV,
  RAW_FX_RATES_CSV,
  RAW_PRIOR_PERIOD_TB_CSV,
  RAW_MANUAL_ADJUSTMENTS_JSON,
} from '../data/mockData';
import {
  Database,
  FileText,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileCode,
  ExternalLink,
  Table,
  Code2,
  RefreshCw,
  ClipboardPaste,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { LocalFileImportModal } from './LocalFileImportModal';

interface DataIngestionInspectorProps {
  onCustomFileUpload?: (fileName: string, content: string) => void;
  onApplyDataset?: (type: 'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR', content: string) => void;
  onResetAllData?: () => void;
}

export const DataIngestionInspector: React.FC<DataIngestionInspectorProps> = ({
  onCustomFileUpload,
  onApplyDataset,
  onResetAllData,
}) => {
  const [activeFile, setActiveFile] = useState<'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR'>('TB');
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/10YrZS27YbxG3De3DK7rnvjvUnK0XEGJNNBxUEREnOyE/edit?gid=1645433792#gid=1645433792'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'auth_required';
    message: string;
  }>({ type: 'idle', message: '' });

  // Paste Modal / Panel state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [pasteTarget, setPasteTarget] = useState<'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR'>('TB');
  const [pastedContent, setPastedContent] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const files = [
    {
      id: 'TB' as const,
      name: 'trial_balance.csv',
      title: 'Trial Balance (Period-End)',
      desc: 'NetSuite Multi-Currency Period-End TB (~80 line items)',
      content: RAW_TB_CSV,
      badge: 'Main Input',
    },
    {
      id: 'COA' as const,
      name: 'chart_of_accounts.csv',
      title: 'Chart of Accounts Hierarchy',
      desc: 'COA mapping hierarchy with Statement & Cash Flow tags',
      content: RAW_COA_CSV,
      badge: 'Taxonomy',
    },
    {
      id: 'ADJ' as const,
      name: 'manual_adjustments.json',
      title: 'Manual Adjustments & JEs',
      desc: '10 Period-End Journal Entries from Corporate Accounting',
      content: JSON.stringify(RAW_MANUAL_ADJUSTMENTS_JSON, null, 2),
      badge: 'Adjustments',
    },
    {
      id: 'FX' as const,
      name: 'fx_rates.csv',
      title: 'Foreign Exchange Rates',
      desc: 'Period-Average and Period-End FX Rate Schedules (USD base)',
      content: RAW_FX_RATES_CSV,
      badge: 'FX Table',
    },
    {
      id: 'PRIOR' as const,
      name: 'prior_period_tb.csv',
      title: 'Prior Period Comparative TB',
      desc: 'Prior-Period Opening Balances & Comparatives (2024-Q3)',
      content: RAW_PRIOR_PERIOD_TB_CSV,
      badge: 'Comparatives',
    },
  ];

  const currentFile = files.find((f) => f.id === activeFile) || files[0];

  // Parse CSV content for Table View
  const parsedTableData = React.useMemo(() => {
    if (activeFile === 'ADJ') {
      try {
        const json = JSON.parse(currentFile.content);
        const entries = json.entries || [];
        const flattened: any[] = [];
        entries.forEach((e: any) => {
          (e.lines || []).forEach((l: any, idx: number) => {
            flattened.push({
              entry_id: idx === 0 ? e.id : '',
              description: idx === 0 ? e.description : '',
              account: l.account,
              debit: l.debit || 0,
              credit: l.credit || 0,
              effective_date: e.effective_date,
            });
          });
        });
        return { headers: ['entry_id', 'description', 'account', 'debit', 'credit', 'effective_date'], rows: flattened };
      } catch (err) {
        return { headers: [], rows: [] };
      }
    }

    const parsed = Papa.parse<Record<string, string>>(currentFile.content.trim(), {
      header: true,
      skipEmptyLines: true,
    });
    const headers = parsed.meta.fields || [];
    return { headers, rows: parsed.data };
  }, [activeFile, currentFile.content]);

  // Handle Fetching Google Sheet via backend proxy
  const handleFetchGoogleSheet = async () => {
    if (!sheetUrl) return;
    setIsLoading(true);
    setFetchStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`/api/fetch-sheet?url=${encodeURIComponent(sheetUrl)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403 || errorData.requiresAuth) {
          setFetchStatus({
            type: 'auth_required',
            message:
              'Google Sheet requires Google Sign-In or private access permissions. To import directly, set permissions to "Anyone with the link can view", or use the "Paste Sheet Cells" option below.',
          });
        } else {
          setFetchStatus({
            type: 'error',
            message: errorData.error || `HTTP ${response.status}: Failed to fetch sheet.`,
          });
        }
        setIsLoading(false);
        return;
      }

      const csvData = await response.text();
      if (onApplyDataset) {
        onApplyDataset(activeFile, csvData);
      }
      setFetchStatus({
        type: 'success',
        message: `Successfully fetched and loaded live data for ${currentFile.name} from Google Sheets!`,
      });
    } catch (err: any) {
      setFetchStatus({
        type: 'error',
        message: err.message || 'Network error fetching Google Sheet data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Custom File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (onCustomFileUpload) {
          onCustomFileUpload(file.name, text);
        }
        if (onApplyDataset) {
          let target: 'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR' = 'TB';
          const nameLower = file.name.toLowerCase();
          if (nameLower.includes('coa') || nameLower.includes('chart')) target = 'COA';
          else if (nameLower.includes('adj') || nameLower.includes('journal')) target = 'ADJ';
          else if (nameLower.includes('fx') || nameLower.includes('rate')) target = 'FX';
          else if (nameLower.includes('prior')) target = 'PRIOR';
          onApplyDataset(target, text);
        }
        setFetchStatus({
          type: 'success',
          message: `Loaded custom file "${file.name}" into LedgerAgent active state.`,
        });
      };
      reader.readAsText(file);
    }
  };

  // Handle Apply Pasted Content
  const handleApplyPasted = () => {
    if (!pastedContent.trim()) return;
    if (onApplyDataset) {
      onApplyDataset(pasteTarget, pastedContent);
      setPasteSuccess(true);
      setFetchStatus({
        type: 'success',
        message: `Custom data successfully parsed and applied to ${pasteTarget} dataset!`,
      });
      setTimeout(() => {
        setPasteSuccess(false);
        setShowPasteModal(false);
        setPastedContent('');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Google Sheet Link Ingestion Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Google Sheets & Raw ERP Data Ingestion</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect, fetch, or paste the assignment sample data spreadsheet tabs. Ingested datasets dynamically recompute the Balance Sheet, Income Statement, Cash Flow DAG, and Reconciliation Desk.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLocalModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
              title="Drag & drop or select local files from your computer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Local Files</span>
            </button>

            <button
              onClick={() => setShowPasteModal(true)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Paste data copied from Google Sheets"
            >
              <ClipboardPaste className="w-4 h-4 text-emerald-400" />
              <span>Paste Sheet Cells</span>
            </button>
          </div>
        </div>

        {/* Live Google Sheet URL Connector */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500">
                <Database className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Paste Google Sheets URL (e.g. https://docs.google.com/spreadsheets/d/...)"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFetchGoogleSheet}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm whitespace-nowrap"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? 'Fetching...' : 'Fetch Sheet Tab'}</span>
              </button>

              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
                title="Open sample data spreadsheet in Google Sheets"
              >
                <span>Open in Sheets</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Status Message / Notification */}
          {fetchStatus.message && (
            <div
              className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                fetchStatus.type === 'success'
                  ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
                  : fetchStatus.type === 'auth_required'
                  ? 'bg-blue-950/50 border border-blue-800 text-blue-300'
                  : 'bg-rose-950/50 border border-rose-800 text-rose-300'
              }`}
            >
              {fetchStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : fetchStatus.type === 'auth_required' ? (
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span>{fetchStatus.message}</span>
                {fetchStatus.type === 'auth_required' && (
                  <div className="mt-1.5 flex items-center gap-3">
                    <button
                      onClick={() => setShowPasteModal(true)}
                      className="underline font-semibold hover:text-white cursor-pointer"
                    >
                      Click here to paste cells directly
                    </button>
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold hover:text-white flex items-center gap-1"
                    >
                      View Sheet in Browser <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seeded Defects Summary Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Complete Inventory of Seeded Defects Handled in Pipeline</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
            Assignment Dataset Baseline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="font-bold text-white flex items-center justify-between">
              <span>1. Trial Balance (trial_balance.csv)</span>
              <span className="text-[10px] text-amber-400 font-mono">3 Defects</span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1.5 space-y-1">
              • <strong>FX Imbalance:</strong> Net foreign currency delta (+412.80 USD)<br />
              • <strong>Duplicate Entry:</strong> Account 1110 USD listed twice ($4.85M & $50k)<br />
              • <strong>Orphan Code:</strong> Account 1999 absent from COA taxonomy
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="font-bold text-white flex items-center justify-between">
              <span>2. Chart of Accounts (COA)</span>
              <span className="text-[10px] text-amber-400 font-mono">3 Defects</span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1.5 space-y-1">
              • <strong>Ambiguous Cash Flow:</strong> Account 2190 unassigned<br />
              • <strong>Ambiguous Statement:</strong> Account 6800 OpEx vs Other<br />
              • <strong>Unmapped Hierarchy:</strong> Node 1500 (Intangibles) zero children
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="font-bold text-white flex items-center justify-between">
              <span>3. Adjustments & FX Schedules</span>
              <span className="text-[10px] text-amber-400 font-mono">4 Defects</span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1.5 space-y-1">
              • <strong>JE-002 Unbalanced:</strong> Debit 28,500 ≠ Credit 25,000<br />
              • <strong>JE-005 Missing COA:</strong> References absent code 6315<br />
              • <strong>JE-008 Circular Loop:</strong> Account 2170 self-loop wash<br />
              • <strong>FX Rates:</strong> Missing CAD spot exchange rate
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Viewer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* File / Tab Selector Toolbar */}
        <div className="p-3 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {files.map((file) => {
              const isActive = activeFile === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setActiveFile(file.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition ${
                  viewMode === 'table' ? 'bg-slate-700 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table Grid</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition ${
                  viewMode === 'raw' ? 'bg-slate-700 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-slate-950">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <div>
              <span className="text-white font-semibold">{currentFile.title}</span> — {currentFile.desc}
            </div>
            <span className="font-mono text-slate-500">
              {parsedTableData.rows.length} rows loaded
            </span>
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto max-h-[500px] border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    {parsedTableData.headers.map((h) => (
                      <th
                        key={h}
                        className="px-3.5 py-2.5 font-semibold text-slate-300 font-mono text-[11px] border-r border-slate-800 last:border-r-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                  {parsedTableData.rows.slice(0, 100).map((row: any, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/60 transition">
                      {parsedTableData.headers.map((h) => {
                        const val = row[h];
                        const isNumber = !isNaN(Number(val)) && val !== '' && typeof val !== 'boolean';
                        return (
                          <td
                            key={h}
                            className={`px-3.5 py-2 text-slate-300 border-r border-slate-850 last:border-r-0 whitespace-nowrap ${
                              isNumber ? 'text-right font-mono' : ''
                            }`}
                          >
                            {isNumber ? Number(val).toLocaleString() : String(val ?? '')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">{currentFile.content}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Direct Sheet Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <ClipboardPaste className="w-5 h-5 text-emerald-400" />
                <h3>Paste Data from Google Sheets or CSV</h3>
              </div>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select target dataset and paste table cells copied directly from your Google Sheet or CSV export.
            </p>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-300">Target Dataset:</label>
              <select
                value={pasteTarget}
                onChange={(e) => setPasteTarget(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="TB">Trial Balance (trial_balance.csv)</option>
                <option value="COA">Chart of Accounts (chart_of_accounts.csv)</option>
                <option value="ADJ">Manual Adjustments (manual_adjustments.json / CSV)</option>
                <option value="FX">FX Rates (fx_rates.csv)</option>
                <option value="PRIOR">Prior Period TB (prior_period_tb.csv)</option>
              </select>
            </div>

            <textarea
              rows={8}
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste cells copied from Google Sheets (tab-separated or comma-separated)..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPasted}
                disabled={!pastedContent.trim() || pasteSuccess}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {pasteSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
                <span>{pasteSuccess ? 'Applied!' : 'Apply to Pipeline'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local File Multi-File Import Modal */}
      <LocalFileImportModal
        isOpen={showLocalModal}
        onClose={() => setShowLocalModal(false)}
        onApplyDataset={onApplyDataset || (() => {})}
      />
    </div>
  );
};
