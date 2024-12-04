import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Your Stripe webhook secret key

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handleStripeWebhook(
    @Body() event: Stripe.Event,
    @Headers('stripe-signature') stripeSignature: string,
  ): Promise<void> {
    let verifiedEvent;

    try {
      verifiedEvent = Stripe.webhooks.constructEvent(
        JSON.stringify(event),
        stripeSignature,
        endpointSecret,
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid signature');
    }

    await this.stripeService.handleEvent(verifiedEvent);
  }
}
