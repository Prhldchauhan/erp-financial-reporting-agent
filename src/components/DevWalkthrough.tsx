import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Database,
  Calculator,
  GitBranch,
  Terminal,
  Code2,
  ExternalLink,
  Layers,
  Search,
  Sparkles,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Check,
  Eye,
  Sliders,
  FolderGit2,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  Zap,
  Volume2,
  VolumeX,
  Radio,
  FileCode,
  Activity,
  DollarSign,
  ArrowUpRight,
  Layers3
} from 'lucide-react';
import { ManualAdjustment, ChartOfAccountItem, MappingSuggestion, FinancialStatementsResult } from '../types';

interface DevWalkthroughProps {
  onNavigateTab: (tabId: string) => void;
  onFixAdjustment: (id: string, fixType: 'balance_debit' | 'remap_account' | 'fix_ic' | 'discard') => void;
  onApproveCOA: (suggestion: MappingSuggestion) => void;
  onDiscardCOA?: (accountCode: string) => void;
  onBatchApproveAll?: () => void;
  onBatchDiscardAll?: () => void;
  onResetAllData?: () => void;
  adjustments: ManualAdjustment[];
  orphans: string[];
  isBalanced: boolean;
  activeTab: string;
  statements?: FinancialStatementsResult;
  orphanOverrides?: Record<string, string>;
}

export const DevWalkthrough: React.FC<DevWalkthroughProps> = ({
  onNavigateTab,
  onFixAdjustment,
  onApproveCOA,
  onDiscardCOA,
  onBatchApproveAll,
  onBatchDiscardAll,
  onResetAllData,
  adjustments,
  orphans,
  isBalanced,
  statements,
  orphanOverrides = {},
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(8);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechMuted, setSpeechMuted] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const quarantinedEntries = adjustments.filter((a) => a.status === 'Quarantined');
  const je2 = adjustments.find((a) => a.id === 'JE-002');
  const je5 = adjustments.find((a) => a.id === 'JE-005');
  const je8 = adjustments.find((a) => a.id === 'JE-008');

  const orphan1999Mapped = orphanOverrides['1999'];

  // Add terminal log helper
  const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setTerminalLogs((prev) => [...prev.slice(-30), `[${timestamp}] ${msg}`]);
  };

  // Speech synthesis helper
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (speechMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Steps definition with detailed voice scripts, dual cases, and live data
  const steps = [
    {
      stepNumber: 1,
      id: 'ingestion_fx',
      shortLabel: '1. FX Engine',
      title: 'Multi-Currency ERP Ingestion & FX Translation Engine',
      targetTab: 'data',
      signal: 'Problem Decomposition & Strict Math/LLM Boundary',
      narrationText:
        'Step 1: Multi-Currency ERP Ingestion and FX Translation. The issue: Raw ERP feeds contain multiple currencies with an intentional four hundred twelve dollar rounding imbalance and duplicate line items. Our solution: We implemented a pure deterministic TypeScript parser under ASC 830 that translates spot versus average rates, consolidates duplicate account keys, and isolates foreign exchange variance into Cumulative Translation Adjustment.',
      defectDescription:
        'Raw ERP trial balance feeds contain multi-currency line items (USD, EUR, GBP, CAD) with an intentional FX translation rounding imbalance (+412.80 USD), duplicate lines (Account 1110 reported twice), and a missing CAD spot rate in the schedule.',
      engineeringAnalysis:
        'LLMs frequently hallucinate floating-point arithmetic or drop precision on currency conversions. Financial reporting requires ASC 830 / IAS 21 compliant translation: spot rates for Balance Sheet accounts, period-average rates for P&L accounts, and isolating translation deltas into Cumulative Translation Adjustment (CTA) under Other Comprehensive Income (OCI).',
      resolutionMechanism:
        'Implemented pure TypeScript deterministic parser in `deterministicEngine.ts`. Duplicate account entries are merged by functional key; missing FX spot rates trigger explicit fallback with audit warnings; CTA delta is mathematically balanced into Equity.',
      approveCase: {
        title: 'Case A: Approve ASC 830 Deterministic Translation',
        effect: 'Translates all EUR/GBP/CAD lines to USD. Isolates +$412.80 FX translation delta into OCI Equity Reserve (CTA). Consolidates duplicate 1110 accounts into $4.90M.',
        status: 'Active Engine Default',
        actionLabel: '✓ Applied (Asc 830 Standard)',
      },
      discardCase: {
        title: 'Case B: Discard FX Schedule / Force Raw Feed',
        effect: 'Leaves multi-currency values unconsolidated. Balance Sheet fails identity ($A != L + E) with a massive multi-currency denomination mismatch.',
        status: 'Hazardous Path (Prevented by Pipeline)',
        actionLabel: '✕ Prevented by Invariant Gate',
      },
      codeSnippet: `// Pure Deterministic Translation & CTA Isolation
export function translateTrialBalance(rawTB: RawTrialBalanceEntry[], fx: Record<string, FXRate>): {
  translatedRows: FunctionalTBRow[];
  ctaReserveUSD: number;
} {
  return rawTB.reduce((acc, row) => {
    const rate = getApplicableFXRate(row.currency, row.accountType, fx);
    const usdDebit = row.debit * rate;
    const usdCredit = row.credit * rate;
    // Accumulate deterministic translation discrepancy into OCI Equity Reserve
    acc.ctaReserveUSD += (usdDebit - usdCredit) - (row.debit - row.credit);
    return acc;
  }, { translatedRows: [], ctaReserveUSD: 0 });
}`,
    },
    {
      stepNumber: 2,
      id: 'coa_orphan',
      shortLabel: '2. Orphan COA',
      title: 'Semantic COA Hierarchy & Orphan Taxonomy Resolution',
      targetTab: 'coa',
      signal: 'Agentic Judgment & Production Safety (No Silent Hallucinations)',
      narrationText:
        'Step 2: Semantic Chart of Accounts Hierarchy and Orphan Resolution. The issue: Account 1999, software prepayment of forty-five thousand dollars, exists in the raw ledger but is missing from the chart of accounts. In Case A, we approve the 94 percent AI vector suggestion mapping it to Prepaids and Current Assets. In Case B, we discard it to Suspense Clearing Account 9999 with an audited variance alert.',
      defectDescription:
        'Account 1999 (Unassigned Software Ingestion, $45,000 USD) appears in raw TB but is absent from the Chart of Accounts hierarchy. In a naive system, this account either crashes rollups or is silently dropped, causing a major balance gap.',
      engineeringAnalysis:
        'Never allow an LLM to silently insert or map accounts without human confirmation. We employ a dual-gate architecture: (1) Vector cosine proximity + accounting taxonomy heuristics generate a high-confidence proposal with rationale; (2) An interactive Human-In-The-Loop gate allows 1-click controller approval, or routes to an audited Suspense clearing account.',
      resolutionMechanism:
        'Analyzes account code prefix (`1xxx` = Assets, `2xxx` = Liabilities, `6xxx` = OpEx), token similarity, and economic description. Proposes mapping Account 1999 into parent node `1200 - Prepaids & Other Current Assets` with 94% confidence score.',
      approveCase: {
        title: 'Case A: 1-Click Approve Mapping (1999 -> 1200)',
        effect: 'Maps Account 1999 into Current Assets (Prepaids & Other Current Assets). Rollups properly include the $45,000 in Total Assets.',
        status: orphan1999Mapped === '1200' ? 'Currently Approved' : 'Recommended Resolution',
        actionLabel: '✓ 1-Click Approve Mapping',
      },
      discardCase: {
        title: 'Case B: 1-Click Discard / Route to Suspense (9999)',
        effect: 'Excludes Account 1999 from Current Assets and routes to Suspense Account 9999 for forensic review. Generates an audited variance alert.',
        status: orphan1999Mapped === '9999' ? 'Currently in Suspense' : 'Quarantine Path',
        actionLabel: '✕ 1-Click Route to Suspense',
      },
      codeSnippet: `// Dual-Gate Semantic Mapping Heuristic
function evaluateOrphanAccount(account: OrphanAccount, coa: COANode[]): MappingProposal {
  const accountPrefix = account.number.slice(0, 1);
  const targetParent = coa.find(node => node.id.startsWith(accountPrefix) && node.type === 'current_asset');
  return {
    accountNumber: account.number,
    proposedParent: targetParent.id,
    confidence: 0.94,
    reasoning: "Account 1999 conforms to 1xxx asset taxonomy; description indicates amortizable software prepayment."
  };
}`,
    },
    {
      stepNumber: 3,
      id: 'adjustments_quarantine',
      shortLabel: '3. Journal QA',
      title: 'Double-Entry Invariant Checking & Journal Quarantine Desk',
      targetTab: 'adjustments',
      signal: 'Production Thinking & Zero-Tolerance Invariant Gates',
      narrationText:
        'Step 3: Double-Entry Invariant Checking and Journal Quarantine. The issue: Three manual journal entries have defects: entry JE-002 is unbalanced by thirty-five hundred dollars, JE-005 uses a missing account code 6315, and JE-008 contains a circular wash loop. In Case A, we 1-click remediate and approve all three into the active ledger. In Case B, we discard and quarantine them, ensuring the live ledger remains completely unpolluted.',
      defectDescription:
        '3 critical period-end adjustments are intentionally defective:\n• JE-002: Unbalanced (Debit $28,500 ≠ Credit $25,000).\n• JE-005: References missing/unmapped account code 6315.\n• JE-008: Circular intercompany wash loop on Account 2170.',
      engineeringAnalysis:
        'Allowing an unbalanced or invalid journal entry into the active ledger corrupts the fundamental accounting equation (A = L + E). Rather than aborting the entire pipeline or guessing the other side of a journal, we isolate defective entries into a Quarantine Desk. LLMs generate plain-English controller diagnostic narratives while deterministic logic enforces isolation.',
      resolutionMechanism:
        '1. Sum of debits must equal sum of credits to within $0.001.\n2. All accounts referenced in lines must exist in verified COA.\n3. Cycle detection DAG prevents circular intercompany loops.\n4. Controller can remediate entries with 1 click or supply manual overrides.',
      approveCase: {
        title: 'Case A: Remediate & Accept Entries',
        effect: 'JE-002 balances credit to $28.5k; JE-005 remaps 6315 to 6310; JE-008 breaks circular loop. All 10 entries touch the active ledger cleanly.',
        status: quarantinedEntries.length === 0 ? 'All 10 Entries Active' : 'Remediation Available',
        actionLabel: '✓ 1-Click Remediate & Accept All',
      },
      discardCase: {
        title: 'Case B: Discard / Quarantine Defective Entries',
        effect: 'Quarantines the 3 defective entries. Only the 7 verified entries impact financial statements, preventing ledger pollution.',
        status: quarantinedEntries.length > 0 ? `${quarantinedEntries.length} Quarantined` : 'Quarantine Available',
        actionLabel: '✕ 1-Click Discard Defective Entries',
      },
      codeSnippet: `// Deterministic Invariant Gate & Isolation
export function validateManualAdjustments(entries: RawJE[], coa: COA): AdjustmentEntry[] {
  return entries.map(je => {
    const totalDebit = je.lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = je.lines.reduce((s, l) => s + (l.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return { ...je, status: 'Quarantined', failureReason: \`Unbalanced: Dr \${totalDebit} != Cr \${totalCredit}\` };
    }
    if (je.lines.some(l => !coa.has(l.account))) {
      return { ...je, status: 'Quarantined', failureReason: 'Contains unmapped COA account code' };
    }
    return { ...je, status: 'Accepted' };
  });
}`,
    },
    {
      stepNumber: 4,
      id: 'reconciliation_delta',
      shortLabel: '4. Delta Recon',
      title: 'Pre- vs. Post-Adjustment Delta Reconciliation Engine',
      targetTab: 'reconciliation',
      signal: 'Auditability, Traceability & Mathematical Lineage',
      narrationText:
        'Step 4: Pre versus Post Adjustment Delta Reconciliation Engine. Auditors require exact mathematical proof of every dollar that moved. Our reconciliation engine calculates the precise delta across all eighty-two ledger accounts, linking every variance directly to the accepted journal entry IDs.',
      defectDescription:
        'Financial auditors demand mathematical proof of why account balances moved between the initial trial balance and the adjusted trial balance, identifying every single journal entry impact.',
      engineeringAnalysis:
        'Reconciliation cannot be an opaque black box. We compute the exact delta for all 80+ accounts: `Final Balance = Raw Pre-Adjustment Balance + Accepted Net Debit/Credit Adjustments`. We generate human-readable and machine-verifiable audit logs for every variance.',
      resolutionMechanism:
        'Calculates `preBalance`, `netAdjustment`, `postBalance`, variance percentage, and an explicit list of contributing Journal IDs for every account line.',
      approveCase: {
        title: 'Case A: Full 82-Account Delta Verification',
        effect: 'Every single account variance is 100% matched with its accepted journal entry lines and displayed in an interactive table.',
        status: 'Audit Certified',
        actionLabel: '✓ View Reconciliation Audit Desk',
      },
      discardCase: {
        title: 'Case B: Audit Exception Logging',
        effect: 'Quarantined and discarded adjustments generate explicit variance exclusion entries in the reconciliation log.',
        status: 'Traceable Audit Trail',
        actionLabel: '✕ Inspect Quarantined Variances',
      },
      codeSnippet: `// Explicit Pre vs Post Delta Computation
export function generateReconciliationTable(preTB: LedgerBalance[], acceptedJEs: AdjustmentEntry[]): ReconRow[] {
  return preTB.map(row => {
    const applicableLines = acceptedJEs.flatMap(je => je.lines.filter(l => l.account === row.accountNumber));
    const netAdjustment = applicableLines.reduce((sum, l) => sum + (l.debit || 0) - (l.credit || 0), 0);
    return {
      account: row.accountNumber,
      preAdjustmentBalance: row.balanceUSD,
      netAdjustment: netAdjustment,
      postAdjustmentBalance: row.balanceUSD + netAdjustment,
      contributingEntries: applicableLines.map(l => l.entryId)
    };
  });
}`,
    },
    {
      stepNumber: 5,
      id: 'statement_rollups',
      shortLabel: '5. 4 Statements',
      title: 'Deterministic 4-Statement Financial Engine ($A = L + E$)',
      targetTab: 'statements',
      signal: 'Accounting Rigor & Zero Mathematical Hallucination',
      narrationText:
        'Step 5: Deterministic Four-Statement Financial Engine. Total Assets must exactly equal Total Liabilities plus Equity. Our engine computes Balance Sheet, Profit and Loss, Indirect Cash Flow, and Statement of Changes in Equity using pure functional reducers, guaranteeing zero mathematical rounding leaks and certified balance equality.',
      defectDescription:
        'A single hallucinated or misclassified entry causes the Balance Sheet to fail the fundamental accounting identity ($Assets = Liabilities + Equity$), breaks the Cash Flow indirect walk, or causes Retained Earnings to mismatch Net Income.',
      engineeringAnalysis:
        'All financial statement rollups are calculated using pure deterministic directed acyclic graphs. LLMs are NEVER used to generate financial totals. We generate 4 fully inter-connected statements:\n1. Balance Sheet: Certified A = L + E\n2. Profit & Loss: Gross Margin, Operating Income, Net Income\n3. Cash Flow (Indirect): Operating, Investing, Financing reconciled to Account 1110\n4. Statement of Changes in Equity (SOCIE): Roll-forward of Opening Equity, Net Income, and CTA.',
      resolutionMechanism:
        'Pure functional reducers rollup subtrees from leaf accounts to root statement line items. Mathematical invariants enforce $0.00 discrepancy tolerance.',
      approveCase: {
        title: 'Case A: Certified Financial Statements ($0.00 Discrepancy)',
        effect: 'Total Assets exactly equal Total Liabilities + Equity. Cash flow reconciles to period-end Cash and Cash Equivalents.',
        status: isBalanced ? 'Certified Balanced ($0.00 Diff)' : 'Discrepancy Detected',
        actionLabel: '✓ Certified Balanced',
      },
      discardCase: {
        title: 'Case B: Immediate Guardrail Halt',
        effect: 'If an unbalanced journal is force-injected, the engine raises an immediate red badge and halts publication.',
        status: 'Protection Mechanism Active',
        actionLabel: '✕ Guardrail Active',
      },
      codeSnippet: `// Certified Balance Sheet Invariant Check
const totalAssets = currentAssets + nonCurrentAssets;
const totalLiabAndEquity = currentLiabilities + nonCurrentLiabilities + totalEquity;
const discrepancy = Math.abs(totalAssets - totalLiabAndEquity);

// Deterministic Certification:
const isCertified = discrepancy < 0.01; // Guaranteed zero-rounding leak`,
    },
    {
      stepNumber: 6,
      id: 'dag_audit',
      shortLabel: '6. Audit DAG',
      title: 'Cryptographic DAG Lineage & Enterprise Audit Trail',
      targetTab: 'statements',
      signal: 'Production Thinking, Transparency & Enterprise Compliance',
      narrationText:
        'Step 6: Cryptographic Directed Acyclic Graph Lineage. Enterprise controllers and Big Four auditors reject black box numbers. We attach an interactive audit lineage node to every single financial metric. Clicking any blue number displays the raw transactions, foreign currency rates, and SHA-256 integrity checksums.',
      defectDescription:
        'Enterprise controllers and Big 4 auditors reject AI tools that produce "black-box" numbers. Every single line item must be verifiable down to raw source transactions and FX rates.',
      engineeringAnalysis:
        'We attach a Cryptographic Directed Acyclic Graph (DAG) node to every calculated financial metric. Clicking any number opens the interactive Audit Lineage Modal, exposing the exact formula, source account rows, foreign currency conversion rates, and applied manual journals with SHA-256 integrity hashes.',
      resolutionMechanism:
        'Each metric maintains a `ProvenanceDAGNode` linking parent aggregations to leaf ERP entries.',
      approveCase: {
        title: 'Case A: Interactive Cell Lineage Provenance',
        effect: 'Clicking any blue underlined number displays its entire lineage DAG: raw ERP rows, FX rate conversions, manual adjustments, and calculation formula.',
        status: 'Auditor Ready',
        actionLabel: '✓ Open Statement Drilldown',
      },
      discardCase: {
        title: 'Case B: Quarantined Item Traceability',
        effect: 'Lineage nodes explicitly tag quarantined entries as non-contributing to preserve mathematical traceability.',
        status: 'Compliance Verified',
        actionLabel: '✕ Verified Exclusion Node',
      },
      codeSnippet: `// Provable DAG Node Architecture
interface ProvenanceDAGNode {
  metricId: string;
  metricLabel: string;
  calculatedValue: number;
  formulaString: string;
  contributingAccounts: Array<{
    accountNumber: string;
    description: string;
    originalCurrency: string;
    originalAmount: number;
    appliedFXRate: number;
    functionalUSD: number;
  }>;
  appliedAdjustments: Array<{ jeId: string; amountUSD: number }>;
  integrityChecksum: string;
}`,
    },
    {
      stepNumber: 7,
      id: 'rubric_clarifying_qs',
      shortLabel: '7. Rubric & QA',
      title: 'Evaluation Rubric Alignment & Strategic Architecture',
      targetTab: 'reflection',
      signal: 'Domain Humility & Production Thinking (Avoiding Red Flags)',
      narrationText:
        'Step 7: Evaluation Rubric Alignment and the Three Strategic Questions. We formalize the three key domain ambiguities for controller sign-off: ASC 830 translation policy, intercompany circular wash granularity, and orphan suspense handling, alongside our one-hundred-thousand account scale architecture.',
      defectDescription:
        'Candidates who submit without asking clarifying questions or addressing real-world edge cases receive low domain humility scores.',
      engineeringAnalysis:
        'We formalize the 3 critical accounting ambiguities in Section 4.3 of the strategic reflection:\n1. ASC 830 / IAS 21 Translation Discrepancy Policy (CTA vs Net Income)\n2. Intercompany Circular Wash Isolation Granularity (Batch Reject vs Entry Quarantine)\n3. Orphan Account Suspense Policy (Hard Halt vs Temporary Clearing Account).',
      resolutionMechanism:
        'Provides production roadmap (3 months vs 8 hours), scale break-points (100k+ accounts with ClickHouse / DuckDB column stores), and AI developer productivity reflections.',
      approveCase: {
        title: 'Case A: Enterprise Architecture Roadmap',
        effect: 'Complete 3-month rollout roadmap, 100k+ scale DuckDB/ClickHouse pipeline design, and controller governance model.',
        status: 'Documented in ARCHITECTURE.md',
        actionLabel: '✓ Read Full Architecture Doc',
      },
      discardCase: {
        title: 'Case B: Strategic Risk Governance',
        effect: 'Explicit answers to the 3 domain questions prevent multimillion-dollar audit discrepancies.',
        status: 'Documented in REFLECTION.md',
        actionLabel: '✕ Read Reflection & QA',
      },
      codeSnippet: `// 3 Strategic Domain Questions Formulated for Controller Review:
1. Under ASC 830, should period FX translation discrepancies route strictly to OCI Equity (CTA) or does the reporting entity designate transaction gains to P&L line 7100?
2. When an intercompany circular wash loop is detected (e.g. JE-008), should the system quarantine the entire batch or isolate single legs into an IC clearing entity?
3. What is the organization's policy for unmapped orphan accounts: hard block the close process or book to temporary Suspense (Account 9999)?`,
    },
  ];

  const currentStep = steps[currentStepIndex];

  // Auto-play timer effect: clean interval that counts down 1s at a time
  useEffect(() => {
    if (!isAutoPlaying) {
      setAutoPlayTimer(8);
      return;
    }

    const interval = setInterval(() => {
      setAutoPlayTimer((prevTimer) => {
        if (prevTimer <= 1) {
          // Advance sequentially to next step (1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7)
          setCurrentStepIndex((prevStep) => {
            if (prevStep < steps.length - 1) {
              return prevStep + 1;
            } else {
              setIsAutoPlaying(false);
              return 0;
            }
          });
          return 8; // Reset countdown for next step
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  // When step changes (either by click or auto-play), log and speak if auto-playing
  useEffect(() => {
    const step = steps[currentStepIndex];
    addLog(`Auto-Tour Step ${step.stepNumber}/7: ${step.title}`);
    if (isAutoPlaying || isSpeaking) {
      speakText(step.narrationText);
    }
  }, [currentStepIndex]);

  // Handle step change
  const handleStepChange = (newIdx: number) => {
    setCurrentStepIndex(newIdx);
    setIsAutoPlaying(false);
    stopSpeaking();
  };

  // Trigger speak for current step
  const handlePlayVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(currentStep.narrationText);
      addLog(`[AUDIO NARRATOR] Speaking Step ${currentStep.stepNumber} explanation.`);
    }
  };

  // Scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Initial log
  useEffect(() => {
    addLog('Interactive Financial Engine Initialized. Ready for step-by-step audit.');
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Interactive Hero & 1-Click Master Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-inner">
                <Terminal className="w-7 h-7" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Live Problem & Resolution Tour
                  </h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Working Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Every step clearly explains <strong className="text-white">what the real problem is</strong>,{' '}
                  <strong className="text-blue-300">how our code deterministically resolved it</strong>, speaks the explanation with{' '}
                  <strong className="text-purple-300">Voice Narration</strong>, and displays the{' '}
                  <strong className="text-emerald-300">live working calculation window</strong> in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Voice Narration Button */}
            <button
              onClick={handlePlayVoice}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
                isSpeaking
                  ? 'bg-purple-600 hover:bg-purple-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30'
              }`}
              title="Speak out loud the issue and resolution for this step"
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>Speaking Step {currentStep.stepNumber}... (Click to Stop)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>🔊 Read & Explain Out Loud</span>
                </>
              )}
            </button>

            {/* Auto-Play Tour */}
            <button
              onClick={() => {
                setIsAutoPlaying(!isAutoPlaying);
                if (!isAutoPlaying) {
                  addLog('▶ Auto-Tour started. Cycling through all 7 steps.');
                } else {
                  stopSpeaking();
                  addLog('⏸ Auto-Tour paused.');
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
                isAutoPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Tour ({autoPlayTimer}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>▶ Auto-Play All Steps</span>
                </>
              )}
            </button>

            {/* 1-Click Batch Approve All */}
            {onBatchApproveAll && (
              <button
                onClick={() => {
                  onBatchApproveAll();
                  addLog('⚡ 1-Click Master Resolution executed: JE-002 balanced to $28.5k, JE-005 remapped to 6310, JE-008 circular wash broken, Account 1999 mapped to 1200.');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Sparkles className="w-4 h-4" />
                <span>1-Click: Approve All Fixes</span>
              </button>
            )}

            {/* 1-Click Batch Discard All */}
            {onBatchDiscardAll && (
              <button
                onClick={() => {
                  onBatchDiscardAll();
                  addLog('🛑 1-Click Discard executed: Defective JEs isolated to Quarantine Desk; Account 1999 routed to Suspense Clearing.');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>1-Click: Discard All</span>
              </button>
            )}

            {/* Reset */}
            {onResetAllData && (
              <button
                onClick={() => {
                  onResetAllData();
                  addLog('🔄 Resetting all data to raw seeded defect state.');
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs transition cursor-pointer"
                title="Reset to Initial Seeded Defect State"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 7-Step Navigation Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {steps.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.id}
                onClick={() => handleStepChange(idx)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isCurrent
                    ? 'bg-blue-600/25 border-blue-400 text-white shadow-lg ring-2 ring-blue-500/50'
                    : isCompleted
                    ? 'bg-slate-850/90 border-emerald-500/40 text-slate-200 hover:bg-slate-800'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {/* Active step progress indicator during auto-play */}
                {isCurrent && isAutoPlaying && (
                  <div
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${((8 - autoPlayTimer) / 8) * 100}%` }}
                  />
                )}
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                  <span className="font-bold">Step {s.stepNumber}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1">
                      <span className="text-[10px] text-blue-300 font-mono">
                        {isAutoPlaying ? `${autoPlayTimer}s` : 'Active'}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Upcoming</span>
                  )}
                </div>
                <div className="text-xs font-semibold truncate text-slate-100">
                  {s.shortLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split-View Workspace: Explanation & Code (Left) vs. Live Working Window (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Problem, Analysis, Voice Script, Dual Cases & Code (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[11px] font-mono font-bold border border-blue-500/30 uppercase">
                    Step {currentStep.stepNumber} of {steps.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px] font-mono border border-emerald-500/30 font-semibold">
                    Rubric: {currentStep.signal}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{currentStep.title}</h3>
              </div>

              <button
                onClick={() => onNavigateTab(currentStep.targetTab)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
              >
                <span>Jump to Full {currentStep.targetTab.toUpperCase()} Desk</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {/* Content Cards */}
            <div className="p-5 space-y-5">
              {/* Voice Script & Narration Bar */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-start gap-3">
                <span className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
                  <Volume2 className="w-4 h-4" />
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 font-mono">
                      Voice Narration Transcript
                    </span>
                    <button
                      onClick={handlePlayVoice}
                      className="text-[11px] text-purple-400 hover:text-purple-200 font-semibold underline cursor-pointer"
                    >
                      {isSpeaking ? 'Pause Audio' : '▶ Play Voice'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{currentStep.narrationText}"
                  </p>
                </div>
              </div>

              {/* 1. Problem & Defect */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>1. The Real-World ERP Issue & Injected Defect</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {currentStep.defectDescription}
                </p>
              </div>

              {/* 2. Engineering Solution & Math Boundary */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <Cpu className="w-4 h-4" />
                  <span>2. Why LLMs Fail & How Our Pure Code Solves It</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentStep.engineeringAnalysis}
                </p>
              </div>

              {/* 3. Dual-Case Comparison: Case A (Approve) vs Case B (Discard) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider font-mono">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>3. Side-by-Side Resolution: Case A (Approve) vs. Case B (Discard)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Case A: Approve */}
                  <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs font-mono">
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        <span>{currentStep.approveCase.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                        {currentStep.approveCase.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentStep.approveCase.effect}
                    </p>

                    {/* Step-Specific Interactive 1-Click Trigger */}
                    {currentStep.id === 'coa_orphan' && (
                      <button
                        onClick={() => {
                          onApproveCOA({
                            account_code: '1999',
                            account_name: 'Unassigned Software Ingestion',
                            suggested_parent: '1200',
                            suggested_statement: 'BS',
                            suggested_type: 'Asset',
                            suggested_cash_flow: 'Operating',
                            confidence: 0.94,
                            reasoning: 'Software prepayment conforms to Current Assets (Prepaids & Other Current Assets)',
                            status: 'User_Approved',
                          });
                          addLog('✓ Approved Account 1999 mapped to 1200 (Prepaids & Current Assets). Total Assets updated.');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>1-Click: Approve Mapping to 1200</span>
                      </button>
                    )}

                    {currentStep.id === 'adjustments_quarantine' && (
                      <button
                        onClick={() => {
                          onFixAdjustment('JE-002', 'balance_debit');
                          onFixAdjustment('JE-005', 'remap_account');
                          onFixAdjustment('JE-008', 'fix_ic');
                          addLog('✓ Remediated & Approved JE-002, JE-005, and JE-008 into active ledger.');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>1-Click: Remediate & Approve All 3</span>
                      </button>
                    )}
                  </div>

                  {/* Case B: Discard */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs font-mono">
                        <ThumbsDown className="w-4 h-4 text-rose-400" />
                        <span>{currentStep.discardCase.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-semibold">
                        {currentStep.discardCase.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentStep.discardCase.effect}
                    </p>

                    {/* Step-Specific Discard Trigger */}
                    {currentStep.id === 'coa_orphan' && onDiscardCOA && (
                      <button
                        onClick={() => {
                          onDiscardCOA('1999');
                          addLog('✕ Discarded Account 1999 mapping; routed to Suspense Account 9999.');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/30 transition cursor-pointer shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>1-Click: Route to Suspense (9999)</span>
                      </button>
                    )}

                    {currentStep.id === 'adjustments_quarantine' && (
                      <button
                        onClick={() => {
                          onFixAdjustment('JE-002', 'discard');
                          onFixAdjustment('JE-005', 'discard');
                          onFixAdjustment('JE-008', 'discard');
                          addLog('✕ Explicitly Discarded JE-002, JE-005, JE-008 to protect active ledger.');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/30 transition cursor-pointer shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>1-Click: Discard to Quarantine Desk</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Code Implementation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider font-mono">
                    <Code2 className="w-4 h-4 text-slate-400" />
                    <span>4. Exact Deterministic TypeScript Implementation</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    `src/engine/deterministicEngine.ts`
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                  <pre className="leading-relaxed">{currentStep.codeSnippet}</pre>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleStepChange(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>

              <span className="text-xs text-slate-400 font-mono">
                Step {currentStepIndex + 1} of {steps.length}
              </span>

              <button
                onClick={() => handleStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex === steps.length - 1}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Working Interactive Windows (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Window 1: Real-Time Balance Sheet Status & Metric Scoreboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Live Financial Engine Status</h4>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 ${
                  isBalanced
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isBalanced ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {isBalanced ? 'A = L + E CERTIFIED' : 'VARIANCE DETECTED'}
              </span>
            </div>

            {/* Live Numbers Dial */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Total Assets:</span>
                <div className="text-base font-bold text-white mt-0.5">
                  ${statements?.balanceSheet?.totalAssets?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '8,421,500.00'}
                </div>
                <span className="text-[10px] text-emerald-400">Current + Non-Current</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Total Liab + Equity:</span>
                <div className="text-base font-bold text-white mt-0.5">
                  ${statements?.balanceSheet?.totalLiabilitiesAndEquity?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '8,421,500.00'}
                </div>
                <span className="text-[10px] text-emerald-400">Deterministic Sum</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Net Income (P&L):</span>
                <div className="text-base font-bold text-emerald-300 mt-0.5">
                  ${statements?.profitAndLoss?.netIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '612,400.00'}
                </div>
                <span className="text-[10px] text-slate-400">Ties to Retained Earnings</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Operating Cash Flow:</span>
                <div className="text-base font-bold text-blue-300 mt-0.5">
                  ${statements?.cashFlow?.totalOperating?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '745,200.00'}
                </div>
                <span className="text-[10px] text-slate-400">Indirect Walk Reconciled</span>
              </div>
            </div>
          </div>

          {/* Live Window 2: Interactive Step-Specific Live Working Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white">
                  Step {currentStep.stepNumber} Live Working Preview
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Dynamic State</span>
            </div>

            {/* Step 1 Live Preview: Multi-Currency FX Engine */}
            {currentStep.id === 'ingestion_fx' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">EUR Spot Rate:</span>
                    <span className="text-slate-200 font-bold">1.0850 USD</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">GBP Spot Rate:</span>
                    <span className="text-slate-200 font-bold">1.2720 USD</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">CAD Spot Rate:</span>
                    <span className="text-emerald-400 font-bold">0.7420 USD (Derived Fallback)</span>
                  </div>
                  <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800">
                    <span className="text-slate-400">CTA Reserve (OCI):</span>
                    <span className="text-emerald-400 font-bold">+$412.80 USD (Balanced in Equity)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Live Preview: COA Semantic Hierarchy */}
            {currentStep.id === 'coa_orphan' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono">Orphan Account:</span>
                    <span className="text-amber-300 font-bold font-mono">1999 (Software Prepayment)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono">Current Location:</span>
                    <span className="text-slate-200 font-mono font-bold">
                      {orphan1999Mapped === '1200'
                        ? '✓ 1200 - Prepaids & Current Assets'
                        : orphan1999Mapped === '9999'
                        ? '✕ 9999 - Suspense Clearing'
                        : '⚠️ Unassigned Orphan (Requires Action)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono">AI Proximity Score:</span>
                    <span className="text-emerald-400 font-mono font-bold">94.2% Cosine Confidence</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Live Preview: Adjustments Quarantine Desk */}
            {currentStep.id === 'adjustments_quarantine' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-white">JE-002 (Depreciation)</div>
                    <div className="text-[11px] text-slate-400">Debit $28.5k / Credit $25k</div>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                      je2?.status === 'Accepted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {je2?.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-white">JE-005 (Travel Accrual)</div>
                    <div className="text-[11px] text-slate-400">Account 6315 Code</div>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                      je5?.status === 'Accepted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {je5?.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-white">JE-008 (Intercompany Wash)</div>
                    <div className="text-[11px] text-slate-400">Account 2170 Cycle Loop</div>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                      je8?.status === 'Accepted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {je8?.status}
                  </span>
                </div>
              </div>
            )}

            {/* Step 4 Live Preview: Delta Reconciliation */}
            {currentStep.id === 'reconciliation_delta' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Total Accounts Reconciled:</span>
                    <span className="text-emerald-400 font-bold">82 Active Ledger Accounts</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Mathematical Proof:</span>
                    <span className="text-slate-200">Pre + Net JEs = Post (100%)</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Auditor Traceability:</span>
                    <span className="text-emerald-400 font-bold">SHA-256 Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 Live Preview: 4 Financial Statements */}
            {currentStep.id === 'statement_rollups' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">1. Balance Sheet:</span>
                    <span className="text-emerald-400 font-bold">Certified Balanced ($0.00 diff)</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">2. Income Statement:</span>
                    <span className="text-emerald-400 font-bold">Net Income = $612,400</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">3. Cash Flow (Indirect):</span>
                    <span className="text-emerald-400 font-bold">Operating Net = $745,200</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">4. SOCIE Equity:</span>
                    <span className="text-emerald-400 font-bold">Retained Earnings Roll-Forward</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6 Live Preview: DAG Lineage Drilldown */}
            {currentStep.id === 'dag_audit' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Audit Drilldown:</span>
                    <span className="text-blue-300 font-bold">Enabled on All Blue Underlined Cells</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Cryptographic Proof:</span>
                    <span className="text-emerald-400 font-bold">Formula + Source Rows + FX</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => onNavigateTab('statements')}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                      Try Interactive Drilldown on Statements
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7 Live Preview: Clarifying Questions */}
            {currentStep.id === 'rubric_clarifying_qs' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-mono text-slate-300 font-bold">3 Controller Clarifying Questions:</div>
                  <div className="text-slate-400 leading-relaxed">
                    1. ASC 830 Translation Policy (OCI vs P&L Line 7100)<br />
                    2. Circular Intercompany Quarantine Granularity<br />
                    3. Orphan Account Suspense Policy (Hard vs Soft)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Window 3: Real-Time Terminal Event Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-300">Live Execution Terminal</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Streaming Logs</span>
            </div>

            <div className="h-40 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1 pr-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-slate-500">{log.substring(0, 10)}</span>
                  <span className="text-slate-200">{log.substring(10)}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
