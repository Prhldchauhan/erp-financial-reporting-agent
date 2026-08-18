import React from 'react';
import {
  ShieldAlert,
  Network,
  Calculator,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';

export type PrototypeSliceId = 'adjustments' | 'coa' | 'statements' | 'reconciliation' | 'tour';

interface SliceFocusBannerProps {
  activeTab: string;
  onSelectSlice: (sliceId: string) => void;
  quarantinedCount: number;
  orphanCount: number;
  isBalanced: boolean;
}

export const SliceFocusBanner: React.FC<SliceFocusBannerProps> = ({
  activeTab,
  onSelectSlice,
  quarantinedCount,
  orphanCount,
  isBalanced,
}) => {
  const slices = [
    {
      id: 'adjustments',
      number: 'Slice 2',
      isFlagship: true,
      icon: ShieldAlert,
      title: 'Manual Adjustments Agent',
      subtitle: 'Balance Violations & Plain-English Rejection Explanations',
      promptBullet: 'Manual adjustments agent that validates entries, detects balance violations, and explains rejections in plain English to a finance user.',
      badge: `${quarantinedCount} Quarantined`,
      badgeColor: quarantinedCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      keyMechanics: 'Double-entry sum invariants, unmapped account code detection, circular intercompany DAG cycle detection, plain-English finance narratives, 1-click remediation desk.'
    },
    {
      id: 'coa',
      number: 'Slice 1',
      isFlagship: false,
      icon: Network,
      title: 'TB → COA Semantic Mapper',
      subtitle: 'Unmapped/Ambiguous Accounts with Confidence & HITL Escalation',
      promptBullet: 'TB → COA mapper that handles unmapped or ambiguous accounts with confidence scores and human-in-the-loop escalation.',
      badge: `${orphanCount} Orphan Pending`,
      badgeColor: orphanCount > 0 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      keyMechanics: 'Vector cosine embeddings + account prefix heuristics, 94% confidence scoring, Human-in-the-loop 1-click approve vs suspense routing (Account 9999).'
    },
    {
      id: 'statements',
      number: 'Slice 3',
      isFlagship: false,
      icon: Calculator,
      title: '4-Statement Financial Engine',
      subtitle: 'Self-Catching Verification Agent ($A = L + E$)',
      promptBullet: 'Statement generator for P&L + Balance Sheet with a verification agent that catches its own errors before output.',
      badge: isBalanced ? 'A = L + E Certified' : 'Discrepancy Detected',
      badgeColor: isBalanced ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      keyMechanics: 'Pure deterministic reducers, zero math hallucination, Retained Earnings tie-out to Net Income, Cash Flow walk, clickable Cryptographic DAG Lineage.'
    },
    {
      id: 'reconciliation',
      number: 'Slice 4',
      isFlagship: false,
      icon: Scale,
      title: 'Pre vs. Post Reconciliation Agent',
      subtitle: 'Line-by-Line Delta Explainer Across 82 Accounts',
      promptBullet: 'Reconciliation agent that, given two TBs (e.g., pre-adjustment vs post-adjustment), explains every delta line by line.',
      badge: '82 Accounts Reconciled',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      keyMechanics: 'Full delta formula (Pre + JEs = Post), variance percentages, direct Journal Entry ID lineage attribution, quarantine exclusion logging.'
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title / Section 4.2 Alignment Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
              Section 4.2 Working Prototype
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              End-to-End Thoughtful Craftsmanship (Messy Mock Data Preserved)
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Interactive Slice Focus Hub • Select & Test Candidate Slices
          </h2>
        </div>

        <div className="text-xs text-slate-300 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-750 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Primary Flagship:</strong> Slice 2 (Manual Adjustments Agent) built with maximum depth.
          </span>
        </div>
      </div>

      {/* 4-Slice Interactive Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slices.map((slice) => {
          const isActive = activeTab === slice.id;
          const Icon = slice.icon;

          return (
            <button
              key={slice.id}
              onClick={() => onSelectSlice(slice.id)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-blue-600/15 border-blue-400 shadow-lg ring-2 ring-blue-500/40 text-white'
                  : 'bg-slate-850/80 border-slate-750 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {slice.isFlagship && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                  ⭐ Flagship Choice
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400 group-hover:text-blue-300'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {slice.number}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border font-semibold ${slice.badgeColor}`}>
                    {slice.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                    {slice.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                    {slice.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-750/60 flex items-center justify-between text-[11px] font-semibold text-blue-400">
                <span>{isActive ? '● Currently Active' : '▶ Switch to this Slice'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
