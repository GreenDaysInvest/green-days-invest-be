import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StripeWebhookService } from 'src/stripe-webhook/stripe-webhook.service'; // Correct service
import Stripe from 'stripe';

@Controller('stripe-webhook')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(private readonly stripeService: StripeWebhookService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia', // Ensure this is the correct API version
    });
  }

  // Type guard to narrow event type to the specific verification report event
  private isVerificationReportCreatedEvent(
    event: Stripe.Event,
  ): event is Stripe.Event & {
    type: 'identity.verification_report.created';
    data: { object: Stripe.Identity.VerificationReport };
  } {
    return event.type === 'identity.verification_report.created';
  }

  @Post()
  async handleWebhook(
    @Body() rawBody: string,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      if (this.isVerificationReportCreatedEvent(event)) {
        const report = event.data.object; // Now TypeScript knows 'data' is present

        // Process the verification report (e.g., verify the user's age)
        await this.stripeService.processVerificationReport(report);
      } else {
        throw new HttpException(
          'Unsupported event type',
          HttpStatus.BAD_REQUEST,
        );
      }

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
