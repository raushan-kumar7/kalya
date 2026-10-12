export type StatementPeriodPreset = 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export type StatementScope = 'expenses' | 'full';

export interface StatementExpenseItem {
  id: string;
  date: string;
  description: string;
  categoryName: string;
  categoryColor?: string;
  paymentMethod: string;
  isSplit: boolean;
  totalBill: number;
  yourShare: number;
  splitStatus: string;
  paidBy: string;
}

export interface StatementIncomeItem {
  id: string;
  date: string;
  source: string;
  amount: number;
  salary: number;
  other: number;
}

export interface StatementBucketSummary {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  percent: number;
  status: 'under' | 'near' | 'over' | 'on_track';
}

export interface StatementCategorySummary {
  id: string;
  label: string;
  amount: number;
  percent: number;
  count: number;
  color?: string;
}

export interface StatementData {
  meta: {
    statementId: string;
    generatedAt: string;
    scope: StatementScope;
  };
  period: {
    preset: StatementPeriodPreset;
    startDate: string;
    endDate: string;
    label: string;
  };
  user: {
    name: string;
    email: string;
    username: string;
    userId: string;
  };
  kpis: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    unsettledSplits: number;
    expensesCount: number;
    incomesCount: number;
  };
  buckets: StatementBucketSummary[];
  categories: StatementCategorySummary[];
  expenses: StatementExpenseItem[];
  incomes: StatementIncomeItem[];
}
