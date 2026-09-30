import { FastifyReply, FastifyRequest } from 'fastify';
import { AlertService } from './alert.service';
import { ApiResponse } from '@/responses';
import { AlertFilterQueryDto, MarkAlertsAsReadDto } from '@kalya/types';

export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  list = async (
    request: FastifyRequest<{ Querystring: AlertFilterQueryDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const items = await this.alertService.listAlerts(userId, request.query);
    return ApiResponse.ok(reply, items, 'Alerts retrieved successfully');
  };

  unreadCount = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const res = await this.alertService.getUnreadCount(userId);
    return ApiResponse.ok(reply, res, 'Unread alert count');
  };

  markRead = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    const updated = await this.alertService.markAsRead(userId, request.params.id);
    return ApiResponse.ok(reply, updated, 'Alert marked as read');
  };

  batchMarkRead = async (
    request: FastifyRequest<{ Body: MarkAlertsAsReadDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const res = await this.alertService.batchMarkAsRead(userId, request.body);
    return ApiResponse.ok(reply, res, 'Alerts marked as read successfully');
  };

  delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.id;
    await this.alertService.deleteAlert(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Alert dismissed');
  };
}
