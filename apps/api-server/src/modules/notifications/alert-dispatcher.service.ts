import { and, eq, alert, notificationPreference } from '@kalya/db';
import { CreateAlertDto } from '@kalya/types';
import type { MailerService } from '@/libs/mail/mailer.service';
import type { JobQueueService } from '../jobs/job-queue.service';

export class AlertDispatcherService {
  constructor(
    private readonly db: any,
    private readonly jobQueue?: JobQueueService,
    private readonly mailer?: MailerService
  ) {}

  private resolveDeepLink(referenceType?: string | null): string {
    switch (referenceType) {
      case 'budget':
        return '/dashboard/budgets';
      case 'split_expense':
        return '/dashboard/splits';
      case 'goal':
        return '/dashboard/goals';
      default:
        return '/dashboard';
    }
  }

  async dispatch(dto: CreateAlertDto & { userId: string }) {
    // 1. Check user notification preferences
    const [pref] = await this.db
      .select()
      .from(notificationPreference)
      .where(
        and(
          eq(notificationPreference.userId, dto.userId),
          eq(
            notificationPreference.category,
            (dto.type === 'budget_alert' ? 'budget_alerts' : 'statement') as any
          )
        )
      )
      .limit(1);

    // If disabled by user preference, skip
    if (pref && !pref.isEnabled) {
      return null;
    }

    // 2. Persist in-app alert record
    const [createdAlert] = await this.db
      .insert(alert)
      .values({
        userId: dto.userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        isRead: false,
        referenceType: dto.reference_type ?? null,
        referenceId: dto.reference_id ?? null,
        metadata: {
          ...(dto.metadata ?? {}),
          ...(dto.severity ? { severity: dto.severity } : {}),
        },
      })
      .returning();

    // 3. Asynchronous Push Notification Dispatch via Job Queue
    if (this.jobQueue) {
      const url = this.resolveDeepLink(dto.reference_type);
      await this.jobQueue
        .enqueue('notification', 'DISPATCH_PUSH', {
          userId: dto.userId,
          title: dto.title,
          body: dto.message,
          url,
          data: {
            alertId: createdAlert.id,
            type: dto.type,
            referenceType: dto.reference_type ?? null,
            referenceId: dto.reference_id ?? null,
          },
        })
        .catch(() => {});
    }

    return createdAlert;
  }
}
