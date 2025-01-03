import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Create a reusable transporter object using Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendTestEmail(): Promise<void> {
  try {
    // Log configuration for debugging (without sensitive data)
    console.log('Email Configuration:', {
      host: 'smtp.gmail.com',
      port: 465,
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });

    const info = await transporter.sendMail({
      from: `"Green Days Invest" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to the same email for testing
      subject: 'Test Email from Green Days Invest',
      text: 'Hello, this is a test email from Green Days Invest!',
      html: `
        <h1>Welcome to Green Days Invest</h1>
        <p>This is a test email to verify that our email system is working correctly.</p>
        <p>If you received this email, it means the configuration is successful!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    });

    console.log('Message sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('Error sending email:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command
    });
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
  }
}

// Run the function
sendTestEmail();
