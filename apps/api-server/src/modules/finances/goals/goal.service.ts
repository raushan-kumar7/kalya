import { and, eq, goal, bucket } from '@kalya/db';
import { CreateGoalDto, GoalFilterQueryDto, UpdateGoalDto } from '@kalya/types';
import { BaseFinanceService } from '../common';
import { calculateGoalPace, roundMoney } from '@kalya/utils';

export class GoalService extends BaseFinanceService {
  async listGoals(userId: string, query: GoalFilterQueryDto) {
    const conditions = [eq(goal.userId, userId)];
    if (query.bucket_id) conditions.push(eq(goal.bucketId, query.bucket_id));
    if (query.status) conditions.push(eq(goal.status, query.status as any));

    const rows = await this.db
      .select()
      .from(goal)
      .where(and(...conditions));

    return rows.map((g) => ({
      ...g,
      pace: calculateGoalPace(
        g.targetAmount ?? 0,
        g.currentProgress ?? 0,
        g.targetDate,
        g.monthlyContributionPlan ?? 0
      ),
    }));
  }

  async getGoalById(userId: string, id: string) {
    const g = await this.assertEntityOwnership(async () => {
      const [row] = await this.db
        .select()
        .from(goal)
        .where(and(eq(goal.id, id), eq(goal.userId, userId)))
        .limit(1);
      return row;
    }, 'Goal');

    return {
      ...g,
      pace: calculateGoalPace(
        g.targetAmount ?? 0,
        g.currentProgress ?? 0,
        g.targetDate,
        g.monthlyContributionPlan ?? 0
      ),
    };
  }

  async createGoal(userId: string, dto: CreateGoalDto) {
    await this.verifyParentExists(bucket, dto.bucket_id, userId, 'Bucket');

    const targetAmount = roundMoney(dto.target_amount);
    const progress = roundMoney(dto.current_progress ?? 0);
    const monthlyPlan = roundMoney(dto.monthly_contribution_plan ?? 0);

    const [created] = await this.db
      .insert(goal)
      .values({
        userId,
        bucketId: dto.bucket_id,
        name: dto.name,
        targetAmount,
        targetDate: dto.target_date,
        currentProgress: progress,
        monthlyContributionPlan: monthlyPlan,
        status: (dto.status ?? 'not_started') as any,
      })
      .returning();

    return created;
  }

  async updateGoal(userId: string, id: string, dto: UpdateGoalDto) {
    await this.getGoalById(userId, id);

    const [updated] = await this.db
      .update(goal)
      .set({
        ...(dto.bucket_id ? { bucketId: dto.bucket_id } : {}),
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.target_amount !== undefined ? { targetAmount: roundMoney(dto.target_amount) } : {}),
        ...(dto.target_date ? { targetDate: dto.target_date } : {}),
        ...(dto.current_progress !== undefined
          ? { currentProgress: roundMoney(dto.current_progress) }
          : {}),
        ...(dto.monthly_contribution_plan !== undefined
          ? { monthlyContributionPlan: roundMoney(dto.monthly_contribution_plan) }
          : {}),
        ...(dto.status ? { status: dto.status as any } : {}),
      })
      .where(and(eq(goal.id, id), eq(goal.userId, userId)))
      .returning();

    return updated;
  }

  async deleteGoal(userId: string, id: string) {
    await this.getGoalById(userId, id);
    await this.db.delete(goal).where(and(eq(goal.id, id), eq(goal.userId, userId)));
    return { success: true };
  }
}
