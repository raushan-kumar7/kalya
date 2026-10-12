import { getMailer, MailerService } from '@/libs/mail';
import { SendEmailJobPayload } from '@kalya/types';
import {
  BudgetAmberWarning,
  BudgetOverspentAlert,
  GoalMilestoneAchieved,
  MonthlyFinancialStatement,
  SplitExpenseRequest,
} from '@kalya/email';
import { log } from '@/logger';

export class EmailJobHandler {
  constructor(private readonly mailer?: MailerService) {}

  private getMailerInstance(): MailerService {
    return this.mailer || getMailer();
  }

  async handle(payload: SendEmailJobPayload): Promise<void> {
    const templateRegistry: Record<string, any> = {
      SplitExpenseRequest,
      BudgetAmberWarning,
      BudgetOverspentAlert,
      GoalMilestoneAchieved,
      MonthlyFinancialStatement,
    };

    const templateComponent = templateRegistry[payload.templateName];
    if (!templateComponent) {
      throw new Error(`Email template "${payload.templateName}" not registered in EmailJobHandler`);
    }

    const mailer = this.getMailerInstance();
    const result = await mailer.sendTemplate({
      to: payload.to,
      from: payload.from,
      subject: payload.subject,
      template: templateComponent,
      props: payload.props,
    });

    log.info('Background email dispatched successfully', {
      to: payload.to,
      subject: payload.subject,
      templateName: payload.templateName,
      messageId: result.messageId,
    });
  }
}
