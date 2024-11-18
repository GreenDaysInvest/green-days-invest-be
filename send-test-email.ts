import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
// Create a reusable transporter object using Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Mailtrap host
  port: parseInt(process.env.EMAIL_PORT || '2525', 10), // Mailtrap port
  auth: {
    user: process.env.EMAIL_USER, // Mailtrap username
    pass: process.env.EMAIL_PASSWORD, // Mailtrap password
  },
});

async function sendTestEmail(): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: '"Test Sender" <test@example.com>', // Sender address
      to: 'recipient@example.com', // Replace with the recipient's email
      subject: 'Test Email from Mailtrap', // Subject line
      text: 'Hello, this is a test email sent via Mailtrap!', // Plain text body
      html: '<b>Hello, this is a test email sent via Mailtrap!</b>', // HTML body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Run the function
sendTestEmail();
