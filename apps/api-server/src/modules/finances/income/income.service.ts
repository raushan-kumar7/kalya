import { and, desc, eq, income } from '@kalya/db';
import { CreateIncomeDto, IncomeFilterQueryDto, UpdateIncomeDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { calculateNetIncome, roundMoney } from '@kalya/utils';
import { ConflictError } from '@/errors';

export class IncomeService extends BaseFinanceService {
  async listIncome(userId: string, query: IncomeFilterQueryDto) {
    const conditions = [eq(income.userId, userId)];
    if (query.month) {
      conditions.push(eq(income.month, query.month));
    }

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    return this.db
      .select()
      .from(income)
      .where(and(...conditions))
      .orderBy(desc(income.month))
      .limit(limit)
      .offset(offset);
  }

  async getIncomeById(userId: string, id: string) {
    return this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(income)
        .where(and(eq(income.id, id), eq(income.userId, userId)))
        .limit(1);
      return row;
    }, 'Income');
  }

  async getIncomeByMonth(userId: string, month: string) {
    const [row] = await this.db
      .select()
      .from(income)
      .where(and(eq(income.userId, userId), eq(income.month, month)))
      .limit(1);
    return row;
  }

  async createIncome(userId: string, dto: CreateIncomeDto) {
    const existing = await this.getIncomeByMonth(userId, dto.month);
    if (existing) {
      throw new ConflictError(`Income for month '${dto.month}' has already been registered`);
    }

    const salary = roundMoney(dto.salary);
    const other = roundMoney(dto.other ?? 0);
    const prev = roundMoney(dto.previous_month_left ?? 0);
    const total = calculateNetIncome(salary, other, prev);

    const [created] = await this.db
      .insert(income)
      .values({
        userId,
        creditDate: dto.credit_date,
        month: dto.month,
        salary,
        other,
        previousMonthLeft: prev,
        totalIncome: total,
      })
      .returning();

    return created;
  }

  async updateIncome(userId: string, id: string, dto: UpdateIncomeDto) {
    const existing = await this.getIncomeById(userId, id);

    const salary = dto.salary !== undefined ? roundMoney(dto.salary) : (existing.salary ?? 0);
    const other = dto.other !== undefined ? roundMoney(dto.other) : (existing.other ?? 0);
    const prev =
      dto.previous_month_left !== undefined
        ? roundMoney(dto.previous_month_left)
        : (existing.previousMonthLeft ?? 0);
    const total = calculateNetIncome(salary, other, prev);

    const [updated] = await this.db
      .update(income)
      .set({
        ...(dto.credit_date ? { creditDate: dto.credit_date } : {}),
        ...(dto.month ? { month: dto.month } : {}),
        salary,
        other,
        previousMonthLeft: prev,
        totalIncome: total,
      })
      .where(and(eq(income.id, id), eq(income.userId, userId)))
      .returning();

    return updated;
  }

  async deleteIncome(userId: string, id: string) {
    await this.getIncomeById(userId, id);
    await this.db.delete(income).where(and(eq(income.id, id), eq(income.userId, userId)));
    return { success: true };
  }
}
