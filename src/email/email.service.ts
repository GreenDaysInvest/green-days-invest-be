import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // for gmail
      //   service: 'gmail', // Use your email service (Gmail, Outlook, etc.)
      //   auth: {
      //     user: process.env.EMAIL_USER, // Your email address
      //     pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
      //   },
      // mailtrap testing
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    console.log(to, 'to email');
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER, // Sender address
        to, // Receiver's email
        subject, // Subject
        text, // Plain text body
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
