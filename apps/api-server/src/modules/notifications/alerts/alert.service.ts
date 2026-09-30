import { and, count, desc, eq, inArray, alert } from '@kalya/db';
import { AlertFilterQueryDto, MarkAlertsAsReadDto } from '@kalya/types';
import { BaseFinanceService } from '../../finances/common';

export class AlertService extends BaseFinanceService {
  async listAlerts(userId: string, query: AlertFilterQueryDto) {
    const conditions = [eq(alert.userId, userId)];

    if (query.is_read !== undefined) conditions.push(eq(alert.isRead, query.is_read));
    if (query.type) conditions.push(eq(alert.type, query.type as any));
    if (query.reference_type) conditions.push(eq(alert.referenceType, query.reference_type));

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    return this.db
      .select()
      .from(alert)
      .where(and(...conditions))
      .orderBy(desc(alert.createdAt))
      .limit(limit)
      .offset(offset);
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

    return updated;
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
