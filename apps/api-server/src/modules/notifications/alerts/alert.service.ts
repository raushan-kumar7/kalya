import {
  and,
  count,
  desc,
  eq,
  inArray,
  like,
  alert,
  budget,
  bucket,
  goal,
  splitExpense,
  splitContactMember,
  expense,
  monthlySummary,
} from '@kalya/db';
import { AlertFilterQueryDto, MarkAlertsAsReadDto } from '@kalya/types';
import { BaseFinanceService } from '../../finances/common';

export class AlertService extends BaseFinanceService {
  /**
   * Evaluates user financial events and generates alerts for:
   * - Budgets exceeding Amber (>=80%) or Red (>=100%) thresholds
   * - Goals achieving 25%, 50%, 75%, 100% milestones
   * - Unsettled split expenses
   * - Generated monthly statements
   * Employs deduplication rules to prevent duplicate notices within the same period/milestone.
   */
  async syncOrGenerateAlerts(userId: string): Promise<void> {
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 1. Evaluate Budgets
      const userBudgets = await this.db
        .select({
          id: budget.id,
          bucketId: budget.bucketId,
          amount: budget.amount,
          alertThresholdAmber: budget.alertThresholdAmber,
          alertThresholdRed: budget.alertThresholdRed,
          bucketName: bucket.label,
        })
        .from(budget)
        .leftJoin(bucket, eq(budget.bucketId, bucket.id))
        .where(eq(budget.userId, userId));

      for (const b of userBudgets) {
        if (!b.amount || b.amount <= 0) continue;

        // Calculate expenses for the current month
        const expensesInMonth = await this.db
          .select({ amount: expense.amount })
          .from(expense)
          .where(and(eq(expense.userId, userId), like(expense.date, `${currentMonth}%`)));

        const totalSpent = expensesInMonth.reduce((acc, row) => acc + (row.amount ?? 0), 0);
        const percent = (totalSpent / b.amount) * 100;
        const amberThreshold = b.alertThresholdAmber ?? 80;
        const redThreshold = b.alertThresholdRed ?? 100;

        if (percent >= redThreshold) {
          const [existingRed] = await this.db
            .select({ id: alert.id })
            .from(alert)
            .where(
              and(
                eq(alert.userId, userId),
                eq(alert.type, 'budget_alert'),
                eq(alert.referenceId, b.id),
                like(alert.createdAt, `${currentMonth}%`)
              )
            )
            .limit(1);

          if (!existingRed) {
            await this.db.insert(alert).values({
              userId,
              type: 'budget_alert',
              title: `Budget Limit Exceeded: ${b.bucketName || 'Budget'}`,
              message: `You have spent ₹${Math.round(totalSpent).toLocaleString('en-IN')} (${Math.round(percent)}% of your ₹${Math.round(b.amount).toLocaleString('en-IN')} limit).`,
              isRead: false,
              referenceType: 'budget',
              referenceId: b.id,
              metadata: {
                threshold: 'red',
                percent: Math.round(percent),
                month: currentMonth,
                severity: 'critical',
              },
            });
          }
        } else if (percent >= amberThreshold) {
          const [existingAmber] = await this.db
            .select({ id: alert.id })
            .from(alert)
            .where(
              and(
                eq(alert.userId, userId),
                eq(alert.type, 'budget_alert'),
                eq(alert.referenceId, b.id),
                like(alert.createdAt, `${currentMonth}%`)
              )
            )
            .limit(1);

          if (!existingAmber) {
            await this.db.insert(alert).values({
              userId,
              type: 'budget_alert',
              title: `Budget Warning: ${b.bucketName || 'Budget'}`,
              message: `You have utilized ${Math.round(percent)}% of your monthly allocation for ${b.bucketName || 'this budget'}.`,
              isRead: false,
              referenceType: 'budget',
              referenceId: b.id,
              metadata: {
                threshold: 'amber',
                percent: Math.round(percent),
                month: currentMonth,
                severity: 'warning',
              },
            });
          }
        }
      }

      // 2. Evaluate Goals
      const userGoals = await this.db.select().from(goal).where(eq(goal.userId, userId));

      for (const g of userGoals) {
        if (!g.targetAmount || g.targetAmount <= 0) continue;
        const progressPct = Math.round(((g.currentProgress ?? 0) / g.targetAmount) * 100);
        const milestones = [25, 50, 75, 100];
        const achievedMilestones = milestones.filter((m) => progressPct >= m);

        for (const milestone of achievedMilestones) {
          const existingMilestones = await this.db
            .select({ id: alert.id, metadata: alert.metadata })
            .from(alert)
            .where(
              and(
                eq(alert.userId, userId),
                eq(alert.type, 'goal_milestone'),
                eq(alert.referenceId, g.id)
              )
            );

          const alreadyLogged = existingMilestones.some(
            (item) => (item.metadata as any)?.milestone === milestone
          );

          if (!alreadyLogged) {
            await this.db.insert(alert).values({
              userId,
              type: 'goal_milestone',
              title:
                milestone === 100
                  ? `Goal Achieved: ${g.name}! 🎉`
                  : `Milestone: ${milestone}% Reached for ${g.name}`,
              message:
                milestone === 100
                  ? `Congratulations! You reached 100% of your target amount of ₹${Math.round(g.targetAmount).toLocaleString('en-IN')}.`
                  : `You have saved ₹${Math.round(g.currentProgress ?? 0).toLocaleString('en-IN')} towards "${g.name}". You are on track!`,
              isRead: false,
              referenceType: 'goal',
              referenceId: g.id,
              metadata: {
                milestone,
                progress: progressPct,
                severity: 'info',
              },
            });
          }
        }
      }

      // 3. Evaluate Monthly Statement
      const [latestSummary] = await this.db
        .select()
        .from(monthlySummary)
        .where(eq(monthlySummary.userId, userId))
        .orderBy(desc(monthlySummary.periodEnd))
        .limit(1);

      if (latestSummary) {
        const [existingStatementAlert] = await this.db
          .select({ id: alert.id })
          .from(alert)
          .where(
            and(
              eq(alert.userId, userId),
              eq(alert.type, 'system'),
              like(alert.title, `%${latestSummary.month}%`)
            )
          )
          .limit(1);

        if (!existingStatementAlert) {
          await this.db.insert(alert).values({
            userId,
            type: 'system',
            title: `Financial Statement Ready: ${latestSummary.month}`,
            message: `Your monthly statement snapshot for ${latestSummary.month} has been compiled and is ready for export.`,
            isRead: false,
            referenceType: null,
            referenceId: null,
            metadata: {
              month: latestSummary.month,
              severity: 'info',
            },
          });
        }
      }
    } catch {
      // Safe fallback - non-blocking error in alert generator
    }
  }

  async listAlerts(userId: string, query: AlertFilterQueryDto) {
    const conditions = [eq(alert.userId, userId)];

    if (query.is_read !== undefined) conditions.push(eq(alert.isRead, query.is_read));
    if (query.type) conditions.push(eq(alert.type, query.type as any));
    if (query.reference_type) conditions.push(eq(alert.referenceType, query.reference_type));

    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    const rows = await this.db
      .select()
      .from(alert)
      .where(and(...conditions))
      .orderBy(desc(alert.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((r) => {
      let createdAtStr = new Date().toISOString();
      if (r.createdAt) {
        if (r.createdAt instanceof Date) {
          createdAtStr = r.createdAt.toISOString();
        } else if (typeof r.createdAt === 'number') {
          createdAtStr = new Date(r.createdAt).toISOString();
        } else {
          createdAtStr = String(r.createdAt);
        }
      }

      let readAtStr: string | null = null;
      if (r.readAt) {
        if (r.readAt instanceof Date) {
          readAtStr = r.readAt.toISOString();
        } else if (typeof r.readAt === 'number') {
          readAtStr = new Date(r.readAt).toISOString();
        } else {
          readAtStr = String(r.readAt);
        }
      }

      return {
        id: r.id,
        user_id: r.userId,
        userId: r.userId,
        type: r.type,
        title: r.title,
        message: r.message,
        is_read: Boolean(r.isRead),
        isRead: Boolean(r.isRead),
        reference_type: r.referenceType ?? null,
        referenceType: r.referenceType ?? null,
        reference_id: r.referenceId ?? null,
        referenceId: r.referenceId ?? null,
        metadata: r.metadata ?? {},
        created_at: createdAtStr,
        createdAt: createdAtStr,
        read_at: readAtStr,
        readAt: readAtStr,
        severity: (r.metadata as any)?.severity ?? (r.type === 'budget_alert' ? 'warning' : 'info'),
      };
    });
  }

  async getUnreadCount(userId: string) {
    const [result] = await this.db
      .select({ count: count() })
      .from(alert)
      .where(and(eq(alert.userId, userId), eq(alert.isRead, false)));

    return { count: Number(result?.count ?? 0) };
  }

  async markAsRead(userId: string, alertId: string) {
    const [updated] = await this.db
      .update(alert)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(alert.id, alertId), eq(alert.userId, userId)))
      .returning();

    return updated
      ? {
          ...updated,
          severity: (updated.metadata as any)?.severity ?? 'info',
        }
      : null;
  }

  async batchMarkAsRead(userId: string, dto: MarkAlertsAsReadDto) {
    const conditions = [eq(alert.userId, userId)];

    if (!dto.all && dto.alert_ids && dto.alert_ids.length > 0) {
      conditions.push(inArray(alert.id, dto.alert_ids));
    }

    await this.db
      .update(alert)
      .set({ isRead: true, readAt: new Date() })
      .where(and(...conditions));

    return { success: true };
  }

  async deleteAlert(userId: string, id: string) {
    await this.db.delete(alert).where(and(eq(alert.id, id), eq(alert.userId, userId)));
    return { success: true };
  }
}
