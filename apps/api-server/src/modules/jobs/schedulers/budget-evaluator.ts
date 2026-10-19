import { and, eq, like, alert, budget, bucket, expense } from '@kalya/db';
import { JobQueueService } from '../job-queue.service';
import { log } from '@/logger';

export class BudgetEvaluatorCron {
  constructor(
    private readonly db: any,
    private readonly jobQueue: JobQueueService
  ) {}

  async run(): Promise<void> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      const activeBudgets = await this.db
        .select({
          id: budget.id,
          userId: budget.userId,
          amount: budget.amount,
          amberThreshold: budget.alertThresholdAmber,
          redThreshold: budget.alertThresholdRed,
          bucketName: bucket.label,
        })
        .from(budget)
        .leftJoin(bucket, eq(budget.bucketId, bucket.id));

      for (const b of activeBudgets) {
        if (!b.amount || b.amount <= 0 || !b.userId) continue;

        // Calculate total spend this month
        const expensesInMonth = await this.db
          .select({ amount: expense.amount })
          .from(expense)
          .where(and(eq(expense.userId, b.userId), like(expense.date, `${currentMonth}%`)));

        const totalSpent = expensesInMonth.reduce(
          (acc: number, row: any) => acc + (row.amount ?? 0),
          0
        );
        const percent = Math.round((totalSpent / b.amount) * 100);
        const red = b.redThreshold ?? 100;

        if (percent >= red) {
          const [existingAlert] = await this.db
            .select({ id: alert.id })
            .from(alert)
            .where(
              and(
                eq(alert.userId, b.userId),
                eq(alert.type, 'budget_alert'),
                eq(alert.referenceId, b.id),
                like(alert.createdAt, `${currentMonth}%`)
              )
            )
            .limit(1);

          if (!existingAlert) {
            const title = `Budget Exceeded: ${b.bucketName || 'Budget'}`;
            const message = `You have spent ₹${Math.round(totalSpent).toLocaleString('en-IN')} (${percent}% of your ₹${Math.round(b.amount).toLocaleString('en-IN')} limit).`;

            // Insert in-app alert
            await this.db.insert(alert).values({
              userId: b.userId,
              type: 'budget_alert',
              title,
              message,
              isRead: false,
              referenceType: 'budget',
              referenceId: b.id,
              metadata: { threshold: 'red', percent, month: currentMonth, severity: 'critical' },
            });

            // Enqueue background push job
            await this.jobQueue.enqueue('notification', 'DISPATCH_PUSH', {
              userId: b.userId,
              title,
              body: message,
              url: '/dashboard/budgets',
              data: { type: 'budget_alert', budgetId: b.id },
            });
          }
        }
      }
    } catch (err) {
      log.error('BudgetEvaluatorCron failed', { error: String(err) });
    }
  }
}
