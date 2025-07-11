import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { config } from '../../config/config';

sgMail.setApiKey(config.notification.email.apiKey);

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendEmail(recipient: string, templateName: string, params: object) {
    try {
      const msg = {
        to: recipient,
        from: `Quizza <${config.notification.email.sender}>`,
        templateId: templateName,
        dynamicTemplateData: params,
      };
      await sgMail.send(msg);
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }
}
