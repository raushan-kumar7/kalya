import { FastifyReply, FastifyRequest } from 'fastify';
import { PreferenceService } from './preference.service';
import { ApiResponse } from '@/responses';
import {
  NotificationPreferenceFilterQueryDto,
  UpdateNotificationPreferenceDto,
  UpsertNotificationPreferenceDto,
} from '@kalya/types';

export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  list = async (
    request: FastifyRequest<{ Querystring: NotificationPreferenceFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.preferenceService.listPreferences(userId, request.query);
    return ApiResponse.ok(reply, items, 'Notification preferences retrieved');
  };

  upsert = async (
    request: FastifyRequest<{ Body: UpsertNotificationPreferenceDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const result = await this.preferenceService.upsertPreference(userId, request.body);
    return ApiResponse.ok(reply, result, 'Preference saved successfully');
  };

  update = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateNotificationPreferenceDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const updated = await this.preferenceService.updatePreference(
      userId,
      request.params.id,
      request.body
    );
    return ApiResponse.ok(reply, updated, 'Preference updated successfully');
  };
}
