export const RAW_COA_CSV = `account_code,account_name,type,parent_code,statement,cash_flow_category,normal_balance,notes
1000,Total Assets,Asset,,BS,NonCash,Debit,Header Node
1100,Current Assets,Asset,1000,BS,Operating,Debit,Subtotal Node
1110,Cash and Cash Equivalents,Asset,1100,BS,Operating,Debit,Operating liquidity
1120,Accounts Receivable Gross,Asset,1100,BS,Operating,Debit,Trade receivables
1121,Allowance for Doubtful Accounts,Asset,1100,BS,Operating,Credit,Contra-asset
1130,Prepaid Expenses and Other Current,Asset,1100,BS,Operating,Debit,Short term prepayments
1140,Inventory - Finished Goods,Asset,1100,BS,Operating,Debit,Trading stock
1150,Inventory - Raw Materials & WIP,Asset,1100,BS,Operating,Debit,Manufacturing stock
1200,Non-Current Assets,Asset,1000,BS,Investing,Debit,Subtotal Node
1210,Property Plant and Equipment Gross,Asset,1200,BS,Investing,Debit,Fixed assets
1211,Accumulated Depreciation - PPE,Asset,1200,BS,NonCash,Credit,Contra-asset
1220,Right-of-Use Operating Lease Assets,Asset,1200,BS,Operating,Debit,ASC 842 leases
1230,Capitalized Software Development,Asset,1200,BS,Investing,Debit,Intangible CAPEX
1240,Security Deposits and Long Term Prepaids,Asset,1200,BS,Investing,Debit,Long-term deposits
1250,Deferred Tax Asset,Asset,1200,BS,NonCash,Debit,Tax timing differences
1500,Non-Current Intangibles & Goodwill,Asset,1000,BS,Investing,Debit,DEFECT: Node has no children mapped
2000,Total Liabilities,Liability,,BS,NonCash,Credit,Header Node
2100,Current Liabilities,Liability,2000,BS,Operating,Credit,Subtotal Node
2110,Accounts Payable,Liability,2100,BS,Operating,Credit,Trade payables
2120,Accrued Expenses & Payroll,Liability,2100,BS,Operating,Credit,Bonus and operating accruals
2130,Deferred Revenue - Current,Liability,2100,BS,Operating,Credit,Unearned revenue
2140,Current Portion of Long Term Debt,Liability,2100,BS,Financing,Credit,Short term borrowings
2150,Current Operating Lease Liability,Liability,2100,BS,Operating,Credit,Lease payments due in 12m
2160,Income Taxes Payable,Liability,2100,BS,Operating,Credit,Tax obligations
2170,Intercompany Payables - UK Subsidiary,Liability,2100,BS,Financing,Credit,Intercompany trading balance
2190,Other Accrued Liabilities,Liability,2100,BS,Unassigned,Credit,DEFECT: Ambiguous cash flow category
2200,Non-Current Liabilities,Liability,2000,BS,Financing,Credit,Subtotal Node
2210,Long Term Senior Debt,Liability,2200,BS,Financing,Credit,Term loan facilities
2220,Non-Current Operating Lease Liability,Liability,2200,BS,Operating,Credit,Long term lease liabilities
2230,Deferred Tax Liability,Liability,2200,BS,NonCash,Credit,Non-current deferred tax
3000,Total Stockholders Equity,Equity,,BS,Financing,Credit,Header Node
3100,Common Stock Par Value,Equity,3000,BS,Financing,Credit,Issued equity
3200,Additional Paid-in Capital,Equity,3000,BS,Financing,Credit,Share premium
3300,Retained Earnings Opening,Equity,3000,BS,Financing,Credit,Cumulative earnings
3400,Cumulative Translation Adjustment (CTA),Equity,3000,BS,Financing,Credit,Foreign currency translation reserve
4000,Total Revenue,Revenue,,PL,Operating,Credit,Header Node
4100,Software Subscription SaaS Revenue,Revenue,4000,PL,Operating,Credit,Recurring SaaS
4200,Professional Services & Implementation,Revenue,4000,PL,Operating,Credit,One-time deployment fees
4300,Usage & Consumption Based Overage,Revenue,4000,PL,Operating,Credit,API usage overage
5000,Cost of Goods Sold (COGS),Expense,,PL,Operating,Debit,Header Node
5100,Cloud Hosting & Infrastructure (AWS/GCP),Expense,5000,PL,Operating,Debit,Server hosting
5200,Customer Support & Success Payroll,Expense,5000,PL,Operating,Debit,Tier 1-3 support team
5300,Third Party Licences & API Subscriptions,Expense,5000,PL,Operating,Debit,Sub-processor fees
6000,Operating Expenses (OpEx),Expense,,PL,Operating,Debit,Header Node
6100,Salaries Wages and Employee Bonuses,Expense,6000,PL,Operating,Debit,Core headcount
6200,Employee Benefits and Healthcare,Expense,6000,PL,Operating,Debit,Benefits
6300,Marketing Advertising and Demand Gen,Expense,6000,PL,Operating,Debit,Growth spend
6310,Travel and Entertainment (T&E),Expense,6000,PL,Operating,Debit,Travel costs
6400,Legal Professional and Audit Fees,Expense,6000,PL,Operating,Debit,External advisory
6500,Depreciation and Amortization Expense,Expense,6000,PL,NonCash,Debit,Non-cash OpEx
6600,Bad Debt Provision Expense,Expense,6000,PL,NonCash,Debit,Credit losses
6700,Facilities Rent and Utilities,Expense,6000,PL,Operating,Debit,Office overhead
6800,Restructuring and One-off Charges,Expense,6000,PL,Unassigned,Debit,DEFECT: Ambiguous OpEx vs Other Expense
7000,Other Income and Expense,OtherIncome,,PL,Investing,Credit,Header Node
7100,Interest Income on Cash Balances,OtherIncome,7000,PL,Operating,Credit,Treasury yield
7200,Interest Expense on Senior Debt,OtherExpense,7000,PL,Operating,Debit,Debt service
7310,Realized and Unrealized FX Gain / Loss,OtherIncome,7000,PL,Operating,Credit,Currency reval
8000,Income Tax Provision,Tax,,PL,Operating,Debit,Header Node
8100,Current Corporate Tax Expense,Tax,8000,PL,Operating,Debit,Current year tax
8200,Deferred Tax Expense / (Benefit),Tax,8000,PL,NonCash,Debit,DTA/DTL movements`;

export const RAW_TB_CSV = `account_code,account_name,currency,debit,credit
1110,Cash and Cash Equivalents - USD Operating,USD,4850200.00,0.00
1110,Cash and Cash Equivalents - EUR Treasury,EUR,1250000.00,0.00
1110,Cash and Cash Equivalents - GBP Settlement,GBP,420000.00,0.00
1110,Cash and Cash Equivalents - USD Operating,USD,50000.00,0.00
1120,Accounts Receivable Gross - Multi,USD,3450000.00,0.00
1120,Accounts Receivable Gross - EUR Billing,EUR,680000.00,0.00
1121,Allowance for Doubtful Accounts,USD,0.00,125000.00
1130,Prepaid Expenses and Other Current,USD,430000.00,0.00
1140,Inventory - Finished Goods,USD,890000.00,0.00
1150,Inventory - Raw Materials & WIP,USD,310000.00,0.00
1210,Property Plant and Equipment Gross,USD,6200000.00,0.00
1211,Accumulated Depreciation - PPE,USD,0.00,2150000.00
1220,Right-of-Use Operating Lease Assets,USD,1850000.00,0.00
1230,Capitalized Software Development,USD,2400000.00,0.00
1240,Security Deposits and Long Term Prepaids,USD,180000.00,0.00
1250,Deferred Tax Asset,USD,520000.00,0.00
1999,Suspense / Unassigned ERP Clearing,USD,14580.00,0.00
2110,Accounts Payable - USD Vendor Ledger,USD,0.00,1650000.00
2110,Accounts Payable - EUR Vendor Ledger,EUR,0.00,340000.00
2110,Accounts Payable - GBP Vendor Ledger,GBP,0.00,110000.00
2120,Accrued Expenses & Payroll,USD,0.00,890000.00
2130,Deferred Revenue - Current,USD,0.00,2850000.00
2130,Deferred Revenue - EUR Contracts,EUR,0.00,450000.00
2140,Current Portion of Long Term Debt,USD,0.00,600000.00
2150,Current Operating Lease Liability,USD,0.00,420000.00
2160,Income Taxes Payable,USD,0.00,185000.00
2170,Intercompany Payables - UK Subsidiary,USD,0.00,320000.00
2190,Other Accrued Liabilities,USD,0.00,140000.00
2210,Long Term Senior Debt,USD,0.00,4800000.00
2220,Non-Current Operating Lease Liability,USD,0.00,1430000.00
2230,Deferred Tax Liability,USD,0.00,380000.00
3100,Common Stock Par Value,USD,0.00,100000.00
3200,Additional Paid-in Capital,USD,0.00,8500000.00
3300,Retained Earnings Opening,USD,0.00,4824580.00
3400,Cumulative Translation Adjustment (CTA),USD,0.00,85000.00
4100,Software Subscription SaaS Revenue,USD,0.00,9400000.00
4100,Software Subscription SaaS Revenue - EUR,EUR,0.00,1850000.00
4200,Professional Services & Implementation,USD,0.00,1250000.00
4300,Usage & Consumption Based Overage,USD,0.00,880000.00
5100,Cloud Hosting & Infrastructure (AWS/GCP),USD,1420000.00,0.00
5200,Customer Support & Success Payroll,USD,980000.00,0.00
5300,Third Party Licences & API Subscriptions,USD,340000.00,0.00
6100,Salaries Wages and Employee Bonuses,USD,4200000.00,0.00
6100,Salaries Wages and Employee Bonuses - GBP,GBP,380000.00,0.00
6200,Employee Benefits and Healthcare,USD,780000.00,0.00
6300,Marketing Advertising and Demand Gen,USD,1350000.00,0.00
6310,Travel and Entertainment (T&E),USD,410000.00,0.00
6400,Legal Professional and Audit Fees,USD,320000.00,0.00
6500,Depreciation and Amortization Expense,USD,785000.00,0.00
6600,Bad Debt Provision Expense,USD,65000.00,0.00
6700,Facilities Rent and Utilities,USD,480000.00,0.00
6800,Restructuring and One-off Charges,USD,120000.00,0.00
7100,Interest Income on Cash Balances,USD,0.00,145000.00
7200,Interest Expense on Senior Debt,USD,285000.00,0.00
7310,Realized and Unrealized FX Gain / Loss,USD,0.00,62000.00
8100,Current Corporate Tax Expense,USD,410000.00,0.00
8200,Deferred Tax Expense / (Benefit),USD,65000.00,0.00`;

export const RAW_FX_RATES_CSV = `currency,period_average,period_end,effective_date,notes
USD,1.0000,1.0000,2024-12-31,Base functional currency
EUR,1.0820,1.0530,2024-12-31,European Central Bank standard rate
GBP,1.2850,1.2580,2024-12-31,Bank of England fix
CAD,0.7420,,2024-12-31,DEFECT: Missing period_end spot rate for CAD
JPY,0.0066,0.00645,2024-12-31,Bank of Japan benchmark rate`;

export const RAW_PRIOR_PERIOD_TB_CSV = `account_code,account_name,currency,debit,credit
1110,Cash and Cash Equivalents,USD,4200000.00,0.00
1120,Accounts Receivable Gross,USD,2950000.00,0.00
1121,Allowance for Doubtful Accounts,USD,0.00,110000.00
1130,Prepaid Expenses and Other Current,USD,390000.00,0.00
1140,Inventory - Finished Goods,USD,780000.00,0.00
1150,Inventory - Raw Materials & WIP,USD,290000.00,0.00
1210,Property Plant and Equipment Gross,USD,5800000.00,0.00
1211,Accumulated Depreciation - PPE,USD,0.00,1935000.00
1220,Right-of-Use Operating Lease Assets,USD,1950000.00,0.00
1230,Capitalized Software Development,USD,1900000.00,0.00
1240,Security Deposits and Long Term Prepaids,USD,175000.00,0.00
1250,Deferred Tax Asset,USD,558000.00,0.00
2110,Accounts Payable,USD,0.00,1480000.00
2120,Accrued Expenses & Payroll,USD,0.00,760000.00
2130,Deferred Revenue - Current,USD,0.00,2450000.00
2140,Current Portion of Long Term Debt,USD,0.00,600000.00
2150,Current Operating Lease Liability,USD,0.00,400000.00
2160,Income Taxes Payable,USD,0.00,165000.00
2170,Intercompany Payables - UK Subsidiary,USD,0.00,320000.00
2190,Other Accrued Liabilities,USD,0.00,120000.00
2210,Long Term Senior Debt,USD,0.00,5400000.00
2220,Non-Current Operating Lease Liability,USD,0.00,1550000.00
2230,Deferred Tax Liability,USD,0.00,342000.00
3100,Common Stock Par Value,USD,0.00,100000.00
3200,Additional Paid-in Capital,USD,0.00,8500000.00
3300,Retained Earnings Opening,USD,0.00,3850000.00
3400,Cumulative Translation Adjustment (CTA),USD,0.00,66000.00
4100,Software Subscription SaaS Revenue,USD,0.00,9800000.00
4200,Professional Services & Implementation,USD,0.00,1100000.00
4300,Usage & Consumption Based Overage,USD,0.00,750000.00
5100,Cloud Hosting & Infrastructure (AWS/GCP),USD,1280000.00,0.00
5200,Customer Support & Success Payroll,USD,890000.00,0.00
5300,Third Party Licences & API Subscriptions,USD,310000.00,0.00
6100,Salaries Wages and Employee Bonuses,USD,3950000.00,0.00
6200,Employee Benefits and Healthcare,USD,720000.00,0.00
6300,Marketing Expenses (Prior Period Renamed),USD,1180000.00,0.00
6310,Travel and Entertainment (T&E),USD,380000.00,0.00
6400,Legal Professional and Audit Fees,USD,290000.00,0.00
6500,Depreciation and Amortization Expense,USD,710000.00,0.00
6600,Bad Debt Provision Expense,USD,50000.00,0.00
6700,Facilities Rent and Utilities,USD,460000.00,0.00
7100,Interest Income on Cash Balances,USD,0.00,110000.00
7200,Interest Expense on Senior Debt,USD,315000.00,0.00
7310,Realized and Unrealized FX Gain / Loss,USD,0.00,45000.00
8100,Current Corporate Tax Expense,USD,360000.00,0.00
8200,Deferred Tax Expense / (Benefit),USD,48000.00,0.00`;

export const RAW_MANUAL_ADJUSTMENTS_JSON = {
  "period": "2024-Q4",
  "functional_currency": "USD",
  "entries": [
    {
      "id": "JE-001",
      "description": "Accrue Q4 bonus pool",
      "date": "2024-12-31",
      "source": "Finance team — bonus accrual workbook v3",
      "lines": [
        {
          "account": "6100",
          "debit": 850000.0,
          "credit": 0.0,
          "memo": "Bonus accrual"
        },
        {
          "account": "2120",
          "debit": 0.0,
          "credit": 850000.0,
          "memo": "Accrual offset"
        }
      ]
    },
    {
      "id": "JE-002",
      "description": "Reclassify marketing spend wrongly booked to T&E",
      "date": "2024-12-28",
      "source": "Controller note 2024-12-28",
      "lines": [
        {
          "account": "6300",
          "debit": 28500.0,
          "credit": 0.0,
          "memo": "Move from T&E"
        },
        {
          "account": "6310",
          "debit": 0.0,
          "credit": 25000.0,
          "memo": "Reverse from T&E"
        }
      ]
    },
    {
      "id": "JE-003",
      "description": "FX revaluation of EUR cash balance to period-end rate",
      "date": "2024-12-31",
      "source": "FX reval calc",
      "lines": [
        {
          "account": "1110",
          "debit": 11200.0,
          "credit": 0.0,
          "memo": "EUR cash uplift"
        },
        {
          "account": "7310",
          "debit": 0.0,
          "credit": 11200.0,
          "memo": "Unrealized FX gain"
        }
      ]
    },
    {
      "id": "JE-004",
      "description": "Bad debt provision top-up",
      "date": "2024-12-31",
      "source": "AR aging review",
      "lines": [
        {
          "account": "6600",
          "debit": 45000.0,
          "credit": 0.0,
          "memo": "Top-up reserve"
        },
        {
          "account": "1121",
          "debit": 0.0,
          "credit": 45000.0,
          "memo": "Increase allowance"
        }
      ]
    },
    {
      "id": "JE-005",
      "description": "Reclass conference travel from old code",
      "date": "2024-12-15",
      "source": "AP team",
      "lines": [
        {
          "account": "6315",
          "debit": 18500.0,
          "credit": 0.0,
          "memo": "Conf travel"
        },
        {
          "account": "6310",
          "debit": 0.0,
          "credit": 18500.0,
          "memo": "Out of T&E"
        }
      ]
    },
    {
      "id": "JE-006",
      "description": "Depreciation catch-up — Q4",
      "date": "2024-12-31",
      "source": "Fixed asset register",
      "lines": [
        {
          "account": "6500",
          "debit": 215000.0,
          "credit": 0.0,
          "memo": "Q4 dep"
        },
        {
          "account": "1211",
          "debit": 0.0,
          "credit": 215000.0,
          "memo": "Accum dep"
        }
      ]
    },
    {
      "id": "JE-007",
      "description": "Deferred tax true-up",
      "date": "2024-12-31",
      "source": "Tax provision memo",
      "lines": [
        {
          "account": "8200",
          "debit": 38000.0,
          "credit": 0.0,
          "memo": "DTA reduction"
        },
        {
          "account": "1250",
          "debit": 0.0,
          "credit": 38000.0,
          "memo": "Reduce DTA"
        }
      ]
    },
    {
      "id": "JE-008",
      "description": "Intercompany settlement — UK sub",
      "date": "2024-12-30",
      "source": "IC reconciliation",
      "lines": [
        {
          "account": "2170",
          "debit": 320000.0,
          "credit": 0.0,
          "memo": "IC payable down"
        },
        {
          "account": "2170",
          "debit": 0.0,
          "credit": 320000.0,
          "memo": "IC payable up"
        }
      ]
    },
    {
      "id": "JE-009",
      "description": "Accrue legal fees for ongoing litigation",
      "date": "2024-12-31",
      "source": "Legal memo dated 2024-12-29",
      "lines": [
        {
          "account": "6400",
          "debit": 75000.0,
          "credit": 0.0,
          "memo": "Legal accrual"
        },
        {
          "account": "2120",
          "debit": 0.0,
          "credit": 75000.0,
          "memo": "Accrued legal"
        }
      ]
    },
    {
      "id": "JE-010",
      "description": "Reclass long-term debt current portion",
      "date": "2024-12-31",
      "source": "Treasury schedule",
      "lines": [
        {
          "account": "2210",
          "debit": 200000.0,
          "credit": 0.0,
          "memo": "Out of LT debt"
        },
        {
          "account": "2140",
          "debit": 0.0,
          "credit": 200000.0,
          "memo": "Into current"
        }
      ]
    }
  ]
};
