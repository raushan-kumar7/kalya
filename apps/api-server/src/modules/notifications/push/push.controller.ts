import { FastifyReply, FastifyRequest } from 'fastify';
import { PushService } from './push.service';
import { ApiResponse } from '@/responses';
import {
  RegisterMobilePushTokenDto,
  RegisterWebPushSubscriptionDto,
  SendTestPushDto,
} from '@kalya/types';

export class PushController {
  constructor(private readonly pushService: PushService) {}

  getVapidKey = async (_request: FastifyRequest, reply: FastifyReply) => {
    const publicKey = this.pushService.getVapidPublicKey();
    return ApiResponse.ok(reply, { publicKey }, 'VAPID public key retrieved');
  };

  registerWeb = async (
    request: FastifyRequest<{ Body: RegisterWebPushSubscriptionDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const subscription = await this.pushService.registerWebPush(userId, request.body);
    return ApiResponse.created(reply, subscription, 'Browser push subscription registered');
  };

  unregisterWeb = async (
    request: FastifyRequest<{ Body: { endpoint: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    await this.pushService.unregisterWebPush(userId, request.body.endpoint);
    return ApiResponse.ok(reply, { success: true }, 'Browser push subscription unregistered');
  };

  registerMobile = async (
    request: FastifyRequest<{ Body: RegisterMobilePushTokenDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const device = await this.pushService.registerMobilePush(userId, request.body);
    return ApiResponse.created(reply, device, 'Mobile push token registered');
  };

  listDevices = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const devices = await this.pushService.listUserDevices(userId);
    return ApiResponse.ok(reply, devices, 'Registered push devices retrieved');
  };

  revokeDevice = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    await this.pushService.revokeDevice(userId, request.params.id);
    return ApiResponse.ok(reply, { success: true }, 'Push device revoked successfully');
  };

  sendTestPush = async (
    request: FastifyRequest<{ Body: SendTestPushDto }>,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
    const result = await this.pushService.sendTestPush(userId, request.body);
    return ApiResponse.ok(reply, result, 'Test push notification dispatched');
  };
}
