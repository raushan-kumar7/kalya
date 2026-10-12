import { DispatchPushJobPayload } from '@kalya/types';
import { PushService } from '../../notifications/push/push.service';
import { log } from '@/logger';

export class PushJobHandler {
  constructor(private readonly pushService: PushService) {}

  async handle(payload: DispatchPushJobPayload): Promise<void> {
    const result = await this.pushService.sendToUser(payload.userId, {
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: {
        url: payload.url,
        ...(payload.data ?? {}),
      },
    });

    log.info('Background push job dispatched', {
      userId: payload.userId,
      sentCount: result.sent,
      failedCount: result.failed,
    });
  }
}
