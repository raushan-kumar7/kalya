import { and, eq, notificationPreference } from '@kalya/db';
import {
  NotificationPreferenceFilterQueryDto,
  UpdateNotificationPreferenceDto,
  UpsertNotificationPreferenceDto,
} from '@kalya/types';
import { BaseFinanceService } from '../../finances/common';

export class PreferenceService extends BaseFinanceService {
  async listPreferences(userId: string, query: NotificationPreferenceFilterQueryDto) {
    const conditions = [eq(notificationPreference.userId, userId)];

    if (query.category) conditions.push(eq(notificationPreference.category, query.category as any));
    if (query.channel) conditions.push(eq(notificationPreference.channel, query.channel as any));
    if (query.is_enabled !== undefined)
      conditions.push(eq(notificationPreference.isEnabled, query.is_enabled));

    return this.db
      .select()
      .from(notificationPreference)
      .where(and(...conditions));
  }

  async upsertPreference(userId: string, dto: UpsertNotificationPreferenceDto) {
    const [existing] = await this.db
      .select({ id: notificationPreference.id })
      .from(notificationPreference)
      .where(
        and(
          eq(notificationPreference.userId, userId),
          eq(notificationPreference.category, dto.category as any),
          eq(notificationPreference.channel, dto.channel as any)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(notificationPreference)
        .set({
          frequency: (dto.frequency ?? 'daily') as any,
          customSchedule: dto.custom_schedule,
          isEnabled: dto.is_enabled ?? true,
        })
        .where(eq(notificationPreference.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(notificationPreference)
      .values({
        userId,
        category: dto.category as any,
        channel: dto.channel as any,
        frequency: (dto.frequency ?? 'daily') as any,
        customSchedule: dto.custom_schedule,
        isEnabled: dto.is_enabled ?? true,
      })
      .returning();

    return created;
  }

  async updatePreference(userId: string, id: string, dto: UpdateNotificationPreferenceDto) {
    const [updated] = await this.db
      .update(notificationPreference)
      .set({
        ...(dto.frequency ? { frequency: dto.frequency as any } : {}),
        ...(dto.custom_schedule !== undefined ? { customSchedule: dto.custom_schedule } : {}),
        ...(dto.is_enabled !== undefined ? { isEnabled: dto.is_enabled } : {}),
      })
      .where(and(eq(notificationPreference.id, id), eq(notificationPreference.userId, userId)))
      .returning();

    return updated;
  }
}
