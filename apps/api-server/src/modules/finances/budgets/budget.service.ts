import { and, eq, budget, bucket, income, expense, category, inArray, sum } from '@kalya/db';
import { BudgetFilterQueryDto, CreateBudgetDto, UpdateBudgetDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { calculateBudgetStatus, roundMoney } from '@kalya/utils';
import { ConflictError } from '@/errors';

export class BudgetService extends BaseFinanceService {
  async listBudgets(userId: string, query: BudgetFilterQueryDto) {
    const conditions = [eq(budget.userId, userId)];
    if (query.bucket_id) conditions.push(eq(budget.bucketId, query.bucket_id));
    if (query.income_id) conditions.push(eq(budget.incomeId, query.income_id));
    if (query.status) conditions.push(eq(budget.status, query.status as any));
    if (query.period) conditions.push(eq(budget.period, query.period as any));

    return this.db
      .select()
      .from(budget)
      .where(and(...conditions));
  }

  async getBudgetById(userId: string, id: string) {
    return this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(budget)
        .where(and(eq(budget.id, id), eq(budget.userId, userId)))
        .limit(1);
      return row;
    }, 'Budget');
  }

  async createBudget(userId: string, dto: CreateBudgetDto) {
    await this.verifyParentExists(bucket, dto.bucket_id, userId, 'Bucket');
    await this.verifyParentExists(income, dto.income_id, userId, 'Income');

    const [existing] = await this.db
      .select({ id: budget.id })
      .from(budget)
      .where(
        and(
          eq(budget.userId, userId),
          eq(budget.bucketId, dto.bucket_id),
          eq(budget.incomeId, dto.income_id)
        )
      )
      .limit(1);

    if (existing) {
      throw new ConflictError('A budget plan for this bucket and income cycle already exists');
    }

    const [created] = await this.db
      .insert(budget)
      .values({
        userId,
        bucketId: dto.bucket_id,
        incomeId: dto.income_id,
        period: (dto.period ?? 'monthly') as any,
        amount: roundMoney(dto.amount),
        alertThresholdAmber: dto.alert_threshold_amber ?? 80,
        alertThresholdRed: dto.alert_threshold_red ?? 100,
        rollover: dto.rollover ?? false,
        status: (dto.status ?? 'under') as any,
      })
      .returning();

    return created;
  }

  async updateBudget(userId: string, id: string, dto: UpdateBudgetDto) {
    await this.getBudgetById(userId, id);

    const [updated] = await this.db
      .update(budget)
      .set({
        ...(dto.bucket_id ? { bucketId: dto.bucket_id } : {}),
        ...(dto.income_id ? { incomeId: dto.income_id } : {}),
        ...(dto.period ? { period: dto.period as any } : {}),
        ...(dto.amount !== undefined ? { amount: roundMoney(dto.amount) } : {}),
        ...(dto.alert_threshold_amber !== undefined
          ? { alertThresholdAmber: dto.alert_threshold_amber }
          : {}),
        ...(dto.alert_threshold_red !== undefined
          ? { alertThresholdRed: dto.alert_threshold_red }
          : {}),
        ...(dto.rollover !== undefined ? { rollover: dto.rollover } : {}),
        ...(dto.status ? { status: dto.status as any } : {}),
      })
      .where(and(eq(budget.id, id), eq(budget.userId, userId)))
      .returning();

    return updated;
  }

  async deleteBudget(userId: string, id: string) {
    await this.getBudgetById(userId, id);
    await this.db.delete(budget).where(and(eq(budget.id, id), eq(budget.userId, userId)));
    return { success: true };
  }

  /**
   * Recalculates consumption and updates status for a budget.
   */
  async recomputeBudgetHealth(userId: string, budgetId: string) {
    const budgetRecord = await this.getBudgetById(userId, budgetId);

    // Get categories under this bucket
    const categories = await this.db
      .select({ id: category.id })
      .from(category)
      .where(and(eq(category.bucketId, budgetRecord.bucketId), eq(category.userId, userId)));

    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) {
      return { ...budgetRecord, spent: 0, status: 'under' };
    }

    const [spendResult] = await this.db
      .select({ totalSpent: sum(expense.yourShare) })
      .from(expense)
      .where(and(eq(expense.userId, userId), inArray(expense.categoryId, categoryIds)));

    const totalSpent = Number(spendResult?.totalSpent ?? 0);
    const health = calculateBudgetStatus(
      budgetRecord.amount ?? 0,
      totalSpent,
      budgetRecord.alertThresholdAmber,
      budgetRecord.alertThresholdRed
    );

    if (health.status !== budgetRecord.status) {
      await this.db
        .update(budget)
        .set({ status: health.status as any })
        .where(eq(budget.id, budgetId));
    }

    return {
      ...budgetRecord,
      spent: totalSpent,
      percentage: health.percentage,
      remaining: health.remaining,
      status: health.status,
    };
  }
}
