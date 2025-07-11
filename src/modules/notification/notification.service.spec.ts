import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import * as sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail');
jest.mock('../../config/config', () => ({
  config: {
    notification: {
      email: {
        apiKey: 'test-api-key',
        sender: 'test@example.com',
      },
    },
  },
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let mockSgMail: jest.Mocked<typeof sgMail>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSgMail = sgMail as jest.Mocked<typeof sgMail>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    loggerErrorSpy = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation();
  });

  describe('sendEmail', () => {
    const recipient = 'test@example.com';
    const templateName = 'welcome-template';
    const params = { name: 'John Doe' };

    it('should send email successfully and return true', async () => {
      mockSgMail.send.mockResolvedValue([{} as sgMail.ClientResponse, {}]);

      const result = await service.sendEmail(recipient, templateName, params);

      expect(result).toBe(true);
      expect(mockSgMail['send']).toHaveBeenCalledWith({
        to: recipient,
        from: 'Quizza <test@example.com>',
        templateId: templateName,
        dynamicTemplateData: params,
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle sendMail error and return false', async () => {
      const error = new Error('SendGrid API error');
      mockSgMail.send.mockRejectedValue(error);

      const result = await service.sendEmail(recipient, templateName, params);

      expect(result).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalledWith(error);
    });
  });
});
