import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { StripeWebhookService } from 'src/stripe-webhook/stripe-webhook.service';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly stripeService: StripeWebhookService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVerificationDocument(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Upload the document to Stripe and create a verification report
      const verificationReport =
        await this.stripeService.uploadVerificationDocument(file);

      // Return the verification report to the frontend
      return {
        message: 'Document uploaded and verification report created',
        verificationReport,
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new HttpException(
        'Error uploading document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
