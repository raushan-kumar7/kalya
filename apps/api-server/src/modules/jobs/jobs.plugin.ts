import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { JobQueueService } from './job-queue.service';
import { JobWorker } from './job-worker';
import { EmailJobHandler } from './handlers/email-job.handler';
import { PushJobHandler } from './handlers/push-job.handler';
import { BudgetEvaluatorCron } from './schedulers/budget-evaluator';
import { SplitReminderCron } from './schedulers/split-reminder';
import { PushService } from '../notifications/push/push.service';

declare module 'fastify' {
  interface FastifyInstance {
    jobQueue: JobQueueService;
    pushService: PushService;
  }
}

export const jobsPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    const db = fastify.db;

    // 1. Instantiate Core Services
    const jobQueue = new JobQueueService(db);
    const pushService = new PushService(db);
    const emailHandler = new EmailJobHandler();
    const pushHandler = new PushJobHandler(pushService);

    // 2. Decorate Fastify Instance
    fastify.decorate('jobQueue', jobQueue);
    fastify.decorate('pushService', pushService);

    // 3. Instantiate & Start Background Worker with instant wake-up
    const worker = new JobWorker(jobQueue, emailHandler, pushHandler, 3000);
    jobQueue.onJobEnqueued(() => worker.wakeUp());
    worker.start();

    // 4. Setup Cron Evaluators (runs every 30 minutes in development/production)
    const budgetCron = new BudgetEvaluatorCron(db, jobQueue);
    const splitCron = new SplitReminderCron(db, jobQueue);

    const cronInterval = setInterval(
      () => {
        budgetCron.run().catch(() => {});
        splitCron.run().catch(() => {});
      },
      30 * 60 * 1000
    );

    // Also run an initial check shortly after boot (after 10s)
    setTimeout(() => {
      budgetCron.run().catch(() => {});
      splitCron.run().catch(() => {});
    }, 10_000);

    // 5. Graceful Cleanup on Fastify Close
    fastify.addHook('onClose', async () => {
      clearInterval(cronInterval);
      worker.stop();
    });
  },
  {
    name: 'jobs-plugin',
    dependencies: ['db-plugin'],
  }
);
