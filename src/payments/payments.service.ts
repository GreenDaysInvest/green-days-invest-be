import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Stripe
    this.stripe = new Stripe(this.configService.get<string>('stripe.secretKey'), {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createPaymentIntent(
    userId: string,
    amount: number,
    currency = 'eur',
  ): Promise<Stripe.PaymentIntent> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.name} ${user.surname}`,
      });
      console.log('Created Stripe customer:', customer);

      await this.userService.updateUser(userId, {
        stripeCustomerId: customer.id,
      });

      user.stripeCustomerId = customer.id;
    }

    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
    });
  }

  async generatePayPalToken(): Promise<string> {
    const PAYPAL_API_BASE_URL =
      'https://api.sandbox.paypal.com/v1/oauth2/token'; // Change to production URL for production
    const PAYPAL_CLIENT_ID = this.configService.get<string>('paypal.clientId');
    const PAYPAL_CLIENT_SECRET = this.configService.get<string>('paypal.clientSecret');

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error(
        'PayPal client ID or secret is not defined in environment variables.',
      );
    }

    try {
      const auth = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
      ).toString('base64');
      const response = await axios.post(
        PAYPAL_API_BASE_URL,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log('Generated PayPal access token:', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error(
        'Error generating PayPal access token:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate PayPal access token');
    }
  }
}
