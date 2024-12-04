import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import Stripe from 'stripe';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerificationService {
  private stripe: Stripe;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async uploadDocumentToStripe(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ verificationUrl: string }> {
    if (!file || !file.path) {
      throw new Error('No file uploaded');
    }

    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        throw new Error('FRONTEND_URL environment variable is not set');
      }

      // Ensure the URL has a scheme
      const returnUrl = frontendUrl.startsWith('http') 
        ? `${frontendUrl}/dashboard`
        : `https://${frontendUrl}/dashboard`;

      // 1. Create the verification session in Stripe
      const session = await this.stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: {
          user_id: userId,
        },
        options: {
          document: {
            require_matching_selfie: false,
            require_id_number: true,
            allowed_types: ['driving_license', 'passport', 'id_card'],
          } as Stripe.Identity.VerificationSessionCreateParams.Options.Document,
        },
        return_url: returnUrl,
      });

      // 2. Upload the document to Stripe
      const fileBuffer = fs.readFileSync(file.path);
      const fileUpload = await this.stripe.files.create(
        {
          purpose: 'identity_document',
          file: {
            data: fileBuffer,
            name: file.originalname,
            type: file.mimetype,
          },
        },
        {
          apiVersion: '2024-11-20.acacia',
        }
      );

      // 3. Update the verification session with the uploaded document
      await this.stripe.identity.verificationSessions.update(
        session.id,
        {
          metadata: {
            file_id: fileUpload.id,
          },
        }
      );

      // Clean up the uploaded file
      fs.unlinkSync(file.path);

      return {
        verificationUrl: session.url,
      };
    } catch (error) {
      // Clean up the uploaded file in case of error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      console.error('Error uploading document to Stripe:', error);
      throw new Error('Failed to upload document to Stripe: ' + (error as Error).message);
    }
  }

  async getVerificationStatus(userId: string): Promise<{ isVerified: boolean }> {
    const user = await this.userService.findById(userId);
    return { isVerified: user.isVerified || false };
  }
}
