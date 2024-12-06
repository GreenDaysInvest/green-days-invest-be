import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Create a reusable transporter object using Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '2525', 10),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendTestEmail(): Promise<void> {
  try {
    // Log configuration for debugging
    console.log('Email Configuration:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
    });

    const info = await transporter.sendMail({
      from: '"Green Days Invest" <test@greendays.com>',
      to: 'your.email@example.com', // Replace this with your email address
      subject: 'Test Email from Green Days Invest',
      text: 'Hello, this is a test email from Green Days Invest!',
      html: `
        <h1>Welcome to Green Days Invest</h1>
        <p>This is a test email to verify that our email system is working correctly.</p>
        <p>If you received this email, it means the configuration is successful!</p>
      `,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
    // Log more detailed error information
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
  }
}

// Run the function
sendTestEmail();
