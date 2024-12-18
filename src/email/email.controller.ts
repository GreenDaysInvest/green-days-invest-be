import { Controller, Post, Body, Get } from '@nestjs/common';
import { EmailService } from './email.service';

interface SendEmailDto {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-payment-confirmation')
  async sendPaymentConfirmation(@Body() emailDto: SendEmailDto) {
    try {
      const result = await this.emailService.sendEmail(
        emailDto.to,
        emailDto.subject,
        emailDto.text,
        emailDto.html
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Test endpoint
  @Get('test')
  async testEmail() {
    try {
      const result = await this.emailService.sendEmail(
        'bennedictphiliphanel@gmail.com', // Replace with your email
        'Test Email from Green Days Invest',
        'This is a test email',
        '<h1>Test Email</h1><p>This is a test email from Green Days Invest</p>'
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Test email error:', error);
      return { success: false, error: error.message };
    }
  }
}
