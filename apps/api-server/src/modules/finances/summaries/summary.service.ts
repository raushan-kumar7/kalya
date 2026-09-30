import { and, eq, monthlySummary, income, expense, splitExpense, sum } from '@kalya/db';
import { GenerateMonthlySummaryDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { roundMoney } from '@kalya/utils';

export class SummaryService extends BaseFinanceService {
  async getDashboardOverview(userId: string, month: string) {
    const [incomeRow] = await this.db
      .select({ total: income.totalIncome })
      .from(income)
      .where(and(eq(income.userId, userId), eq(income.month, month)))
      .limit(1);

    const totalIncome = Number(incomeRow?.total ?? 0);

    const [expenseRow] = await this.db
      .select({ totalSpent: sum(expense.yourShare) })
      .from(expense)
      .where(and(eq(expense.userId, userId), eq(expense.date, month)));

    const totalExpenses = Number(expenseRow?.totalSpent ?? 0);
    const netSavings = roundMoney(totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? roundMoney((netSavings / totalIncome) * 100) : 0;

    const [splitRow] = await this.db
      .select({ unsettled: sum(splitExpense.amount) })
      .from(splitExpense)
      .where(and(eq(splitExpense.userId, userId), eq(splitExpense.settled, false)));

    const unsettledSplitAmount = Number(splitRow?.unsettled ?? 0);

    return {
      month,
      total_income: roundMoney(totalIncome),
      total_expenses: roundMoney(totalExpenses),
      net_savings: netSavings,
      savings_rate: savingsRate,
      budget_adherence_percent:
        totalIncome > 0 ? roundMoney((totalExpenses / totalIncome) * 100) : 0,
      unsettled_split_amount: roundMoney(unsettledSplitAmount),
    };
  }

  async generateMonthlyStatement(userId: string, dto: GenerateMonthlySummaryDto) {
    const overview = await this.getDashboardOverview(userId, dto.month);

    const [statement] = await this.db
      .insert(monthlySummary)
      .values({
        userId,
        month: dto.month,
        periodStart: dto.period_start ?? `${dto.month}-01`,
        periodEnd: dto.period_end ?? `${dto.month}-31`,
        bucketTotals: {},
        categoryTotals: {},
        totalSpent: overview.total_expenses,
        generatedAt: new Date().toISOString(),
      })
      .returning();

    return statement;
  }
}
