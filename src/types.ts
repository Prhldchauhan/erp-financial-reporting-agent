export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'OtherIncome' | 'OtherExpense' | 'Tax';
export type StatementType = 'BS' | 'PL';
export type NormalBalance = 'Debit' | 'Credit';
export type CashFlowCategory = 'Operating' | 'Investing' | 'Financing' | 'NonCash' | 'Unassigned';

export interface ChartOfAccountItem {
  account_code: string;
  account_name: string;
  type: AccountType;
  parent_code: string | null;
  statement: StatementType;
  cash_flow_category: CashFlowCategory;
  normal_balance: NormalBalance;
  notes?: string;
  is_ambiguous?: boolean;
}

export interface RawTrialBalanceItem {
  id: string;
  account_code: string;
  account_name: string;
  currency: string;
  debit: number;
  credit: number;
  period: string;
}

export interface TranslatedTrialBalanceItem extends RawTrialBalanceItem {
  fx_rate_used: number;
  fx_rate_type: 'Spot' | 'Average' | 'None';
  translated_debit: number;
  translated_credit: number;
  net_functional: number; // Positive = Debit normal or Credit normal based on account
  is_orphan?: boolean;
  is_duplicate?: boolean;
}

export interface FXRateItem {
  currency: string;
  period_average: number | null;
  period_end: number | null;
  effective_date: string;
  notes?: string;
}

export interface AdjustmentLine {
  account: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface ManualAdjustment {
  id: string;
  description: string;
  date: string;
  source: string;
  lines: AdjustmentLine[];
  status: 'Accepted' | 'Rejected' | 'Quarantined' | 'Pending';
  validation_errors: string[];
  ai_explanation?: string;
  remediation_suggestion?: string;
  is_circular_ic?: boolean;
  is_unbalanced?: boolean;
  has_orphan_account?: boolean;
}

export interface LineageSourceItem {
  type: 'Raw_TB' | 'Manual_Adjustment' | 'FX_Translation' | 'Prior_Period';
  referenceId: string;
  account_code: string;
  account_name: string;
  currency: string;
  original_amount: number;
  fx_rate?: number;
  functional_amount: number;
  description: string;
}

export interface AuditLineageNode {
  cellId: string;
  statement: 'BalanceSheet' | 'ProfitAndLoss' | 'CashFlow' | 'SOCIE';
  lineItemName: string;
  accountCodes: string[];
  finalValue: number;
  priorValue?: number;
  formulaDescription: string;
  sources: LineageSourceItem[];
  reconciliationChecksum: number;
}

export interface StatementLineItem {
  code?: string;
  name: string;
  currentPeriod: number;
  priorPeriod?: number;
  delta?: number;
  deltaPct?: number;
  isHeader?: boolean;
  isTotal?: boolean;
  level?: number;
  cellId: string;
  accountCodes?: string[];
  trace?: AuditLineageNode;
}

export interface FinancialStatementsResult {
  balanceSheet: {
    assets: StatementLineItem[];
    totalAssets: number;
    liabilities: StatementLineItem[];
    totalLiabilities: number;
    equity: StatementLineItem[];
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
    balanceDelta: number;
  };
  profitAndLoss: {
    revenue: StatementLineItem[];
    totalRevenue: number;
    costOfGoodsSold: StatementLineItem[];
    grossProfit: number;
    operatingExpenses: StatementLineItem[];
    operatingIncome: number;
    otherIncomeExpense: StatementLineItem[];
    taxExpense: StatementLineItem[];
    netIncome: number;
    priorNetIncome?: number;
  };
  cashFlow: {
    operatingActivities: StatementLineItem[];
    totalOperating: number;
    investingActivities: StatementLineItem[];
    totalInvesting: number;
    financingActivities: StatementLineItem[];
    totalFinancing: number;
    netCashChange: number;
    beginningCash: number;
    endingCash: number;
    balanceSheetCash: number;
    isReconciled: boolean;
  };
  equityStatement: {
    beginningEquity: number;
    netIncomeContribution: number;
    dividendsOrDraws: number;
    fxTranslationAdjustment: number;
    otherComprehensiveIncome: number;
    endingEquity: number;
    balanceSheetEquity: number;
    isReconciled: boolean;
  };
  diagnostics: {
    totalRawDebitsUSD: number;
    totalRawCreditsUSD: number;
    tbImbalanceUSD: number;
    fxRoundingImbalanceUSD: number;
    totalAdjustmentsDebits: number;
    totalAdjustmentsCredits: number;
    orphanAccountsCount: number;
    quarantinedAdjustmentsCount: number;
    reconciledCleanly: boolean;
  };
}

export interface MappingSuggestion {
  account_code: string;
  account_name: string;
  suggested_parent: string;
  suggested_statement: StatementType;
  suggested_type: AccountType;
  suggested_cash_flow: CashFlowCategory;
  confidence: number;
  reasoning: string;
  status: 'Auto_Mapped' | 'Needs_Review' | 'User_Approved';
}
