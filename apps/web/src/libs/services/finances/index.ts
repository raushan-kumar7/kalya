import { AssetService } from './assets.service';
import { BucketService } from './buckets.service';
import { BudgetService } from './budgets.service';
import { CategoryService } from './categories.service';
import { ExpenseService } from './expenses.service';
import { GoalService } from './goals.service';
import { IncomeService } from './income.service';
import { SplitService } from './splits.service';
import { SummaryService } from './summaries.service';

export const FinanceService = {
  buckets: BucketService,
  categories: CategoryService,
  income: IncomeService,
  budgets: BudgetService,
  expenses: ExpenseService,
  splits: SplitService,
  goals: GoalService,
  assets: AssetService,
  summaries: SummaryService,
};

export * from './helper';
