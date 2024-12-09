import { Controller, Post, Body } from '@nestjs/common';
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
}
