import { and, eq, lte, alert, splitExpense, splitContactMember, expense } from '@kalya/db';
import { JobQueueService } from '../job-queue.service';
import { log } from '@/logger';

export class SplitReminderCron {
  constructor(
    private readonly db: any,
    private readonly jobQueue: JobQueueService
  ) {}

  async run(): Promise<void> {
    const threeDaysAgoStr = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    try {
      const pendingSplits = await this.db
        .select({
          id: splitExpense.id,
          userId: splitExpense.userId,
          amount: splitExpense.amount,
          contactName: splitContactMember.name,
          date: expense.date,
        })
        .from(splitExpense)
        .leftJoin(expense, eq(splitExpense.expenseId, expense.id))
        .leftJoin(splitContactMember, eq(splitExpense.splitMemberId, splitContactMember.id))
        .where(and(eq(splitExpense.settled, false), lte(expense.date, threeDaysAgoStr)))
        .limit(20);

      for (const sp of pendingSplits) {
        if (!sp.userId) continue;

        const [existing] = await this.db
          .select({ id: alert.id })
          .from(alert)
          .where(
            and(
              eq(alert.userId, sp.userId),
              eq(alert.type, 'split_update'),
              eq(alert.referenceId, sp.id)
            )
          )
          .limit(1);

        if (!existing) {
          const title = `Unsettled Split Reminder: ${sp.contactName || 'Pending Share'}`;
          const message = `Pending unsettled balance of ₹${Math.round(sp.amount ?? 0).toLocaleString('en-IN')} with ${sp.contactName || 'a contact'} from ${sp.date || 'a few days ago'}.`;

          await this.db.insert(alert).values({
            userId: sp.userId,
            type: 'split_update',
            title,
            message,
            isRead: false,
            referenceType: 'split_expense',
            referenceId: sp.id,
            metadata: { amount: sp.amount, contact: sp.contactName, severity: 'warning' },
          });

          await this.jobQueue.enqueue('notification', 'DISPATCH_PUSH', {
            userId: sp.userId,
            title,
            body: message,
            url: '/dashboard/splits',
            data: { type: 'split_reminder', splitExpenseId: sp.id },
          });
        }
      }
    } catch (err) {
      log.error('SplitReminderCron failed', { error: String(err) });
    }
  }
}
