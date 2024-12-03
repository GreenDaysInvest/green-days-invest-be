import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async uploadVerificationDocument(file: Express.Multer.File) {
    const fileBuffer = file.buffer;

    const fileUpload = await this.stripe.files.create({
      purpose: 'identity_document',
      file: {
        data: fileBuffer,
        name: file.originalname,
        type: file.mimetype,
      },
    });

    const verificationReport =
      await this.stripe.identity.verificationReports.create({
        file: fileUpload.id, // Use the file ID from the file upload
      });

    return verificationReport;
  }
}
