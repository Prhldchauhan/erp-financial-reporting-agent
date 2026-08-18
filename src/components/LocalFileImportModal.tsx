import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  Layers,
  Database
} from 'lucide-react';
import Papa from 'papaparse';

interface LocalFileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (type: 'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR', content: string) => void;
}

interface StagedFile {
  id: string;
  file: File;
  targetType: 'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR';
  content: string;
  rowCount: number;
  status: 'valid' | 'warning' | 'invalid';
  summary: string;
}

export const LocalFileImportModal: React.FC<LocalFileImportModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
}) => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectTargetType = (filename: string, content: string): 'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR' => {
    const lower = filename.toLowerCase();
    if (lower.includes('coa') || lower.includes('chart')) return 'COA';
    if (lower.includes('prior') || lower.includes('opening')) return 'PRIOR';
    if (lower.includes('adj') || lower.includes('journal') || lower.includes('manual')) return 'ADJ';
    if (lower.includes('fx') || lower.includes('rate') || lower.includes('currency')) return 'FX';
    if (lower.includes('trial') || lower.includes('tb') || lower.includes('balance')) return 'TB';

    // Content-based heuristics
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) return 'ADJ';
    if (content.includes('account_type') || content.includes('financial_statement') || content.includes('parent_account')) return 'COA';
    if (content.includes('from_currency') || content.includes('period_end_rate')) return 'FX';
    if (content.includes('period') && content.includes('debit') && content.includes('credit')) return 'TB';

    return 'TB';
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const targetType = detectTargetType(file.name, text);

    let rowCount = 0;
    let status: 'valid' | 'warning' | 'invalid' = 'valid';
    let summary = '';

    if (targetType === 'ADJ') {
      try {
        const json = JSON.parse(text);
        const entries = Array.isArray(json) ? json : json.entries || [];
        rowCount = entries.length;
        summary = `${rowCount} Journal Entries parsed successfully from JSON`;
      } catch {
        // Try CSV parse
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        rowCount = parsed.data.length;
        summary = `${rowCount} rows parsed from CSV adjustments`;
      }
    } else {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      rowCount = parsed.data.length;
      if (rowCount === 0) {
        status = 'invalid';
        summary = 'No data rows found in CSV file.';
      } else {
        const headers = parsed.meta.fields || [];
        summary = `${rowCount} rows, ${headers.length} columns detected (${headers.slice(0, 3).join(', ')}...)`;
      }
    }

    const staged: StagedFile = {
      id: Math.random().toString(36).substring(2, 9),
      file,
      targetType,
      content: text,
      rowCount,
      status,
      summary,
    };

    setStagedFiles((prev) => [...prev.filter((p) => p.targetType !== targetType), staged]);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      processFile(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyAllStaged = () => {
    stagedFiles.forEach((item) => {
      onApplyDataset(item.targetType, item.content);
    });
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
      setStagedFiles([]);
    }, 1200);
  };

  const targetLabels: Record<'TB' | 'COA' | 'ADJ' | 'FX' | 'PRIOR', { label: string; file: string; color: string }> = {
    TB: { label: 'Current Trial Balance', file: 'trial_balance.csv', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    COA: { label: 'Chart of Accounts', file: 'chart_of_accounts.csv', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    ADJ: { label: 'Manual Adjustments', file: 'manual_adjustments.json', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    FX: { label: 'FX Exchange Rates', file: 'fx_rates.csv', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    PRIOR: { label: 'Prior Period Trial Balance', file: 'prior_period_tb.csv', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Import Local Data Files (CSV / JSON)
              </h2>
              <p className="text-xs text-slate-400">
                Upload your local ERP trial balances, custom COA hierarchy, or manual adjustments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Drag & Drop Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                : 'border-slate-750 bg-slate-850/50 hover:bg-slate-800/80 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFilesSelected(e.target.files)}
              multiple
              accept=".csv,.json,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shadow-inner">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  Drag and drop local CSV or JSON files here, or <span className="text-blue-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400">
                  Supports <span className="font-mono text-slate-300">trial_balance.csv</span>, <span className="font-mono text-slate-300">chart_of_accounts.csv</span>, <span className="font-mono text-slate-300">manual_adjustments.json</span>, <span className="font-mono text-slate-300">fx_rates.csv</span>
                </p>
              </div>
            </div>
          </div>

          {/* Staged Files List */}
          {stagedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Files Ready to Ingest ({stagedFiles.length})
                </span>
                <button
                  onClick={() => setStagedFiles([])}
                  className="text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {stagedFiles.map((staged) => {
                  const targetInfo = targetLabels[staged.targetType];
                  return (
                    <div
                      key={staged.id}
                      className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                          {staged.targetType === 'ADJ' ? <FileCode className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {staged.file.name}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border font-semibold ${targetInfo.color}`}>
                              Maps to: {targetInfo.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {staged.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={staged.targetType}
                          onChange={(e) => {
                            const newType = e.target.value as any;
                            setStagedFiles((prev) =>
                              prev.map((p) => (p.id === staged.id ? { ...p, targetType: newType } : p))
                            );
                          }}
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="TB">Current TB</option>
                          <option value="COA">Chart of Accounts</option>
                          <option value="ADJ">Manual Adjustments</option>
                          <option value="FX">FX Rates</option>
                          <option value="PRIOR">Prior TB</option>
                        </select>

                        <button
                          onClick={() => setStagedFiles((prev) => prev.filter((p) => p.id !== staged.id))}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-850 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Dataset Selector / Presets */}
          <div className="bg-slate-850/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Assignment Mock Dataset Built-In:</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              LedgerAgent already bundles the official take-home files with all seeded edge cases. You can test your own custom accounting files at any time using the local file dropzone above.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-850">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {importSuccess ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Files Ingested & Recalculated!</span>
              </div>
            ) : (
              <button
                onClick={handleApplyAllStaged}
                disabled={stagedFiles.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
                  stagedFiles.length > 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Ingest & Recalculate Financials ({stagedFiles.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
