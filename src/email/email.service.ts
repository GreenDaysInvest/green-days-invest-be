import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Create transporter with App Password
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_APP_PASSWORD'),
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('Email transporter initialized and verified successfully');
    } catch (error) {
      console.error('Error initializing email transporter:', error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, text: string, html: string) {
    try {
      if (!this.transporter) {
        console.log('Transporter not initialized, attempting to initialize...');
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to,
        subject,
        text,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
