import {
  Controller,
  Post,
  Headers,
  BadRequestException,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';

declare module 'express' {
  interface Request {
    rawBody?: Buffer;
  }
}

@Controller('webhooks')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');
    const endpointSecret = this.configService.get<string>('stripe.webhookSecret');
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });
    
    console.log(stripeSecretKey, endpointSecret, "endpointSecret")
    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
    }
  }

  @Post('/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    try {
      console.log('Received webhook from Stripe');
      
      if (!signature) {
        console.error('No stripe-signature header found');
        throw new BadRequestException('No signature header');
      }

      const endpointSecret = this.configService.get<string>('stripe.webhookSecret');
      if (!endpointSecret) {
        console.error('Webhook secret is not configured');
        throw new BadRequestException('Webhook not configured');
      }

      if (!request.rawBody) {
        console.error('No raw body found in request');
        throw new BadRequestException('No raw body found');
      }

      console.log('Raw body is buffer:', Buffer.isBuffer(request.rawBody));
      console.log('Raw body length:', request.rawBody.length);
      
      // Verify the event
      const event = this.stripeService.constructEvent(
        request.rawBody,
        signature
      );
      
      console.log('Successfully verified webhook signature');
      console.log('Webhook event type:', event.type);
      
      // Handle the event
      await this.stripeService.handleEvent(event);
      
      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error.message);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }
}
