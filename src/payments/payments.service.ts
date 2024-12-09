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
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
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
    const PAYPAL_API_BASE_URL = 'https://api.sandbox.paypal.com/v1/oauth2/token';
    const PAYPAL_CLIENT_ID = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    console.log('PayPal Configuration:', {
      apiUrl: PAYPAL_API_BASE_URL,
      clientIdLength: PAYPAL_CLIENT_ID?.length,
      secretLength: PAYPAL_CLIENT_SECRET?.length,
      clientIdPrefix: PAYPAL_CLIENT_ID?.substring(0, 10),
      secretPrefix: PAYPAL_CLIENT_SECRET?.substring(0, 10),
    });

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error(
        'PayPal client ID or secret is not defined in environment variables.',
      );
    }

    try {
      const auth = Buffer.from(
        `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
      ).toString('base64');

      console.log('Making PayPal token request with auth prefix:', auth.substring(0, 10));
      
      const response = await axios.post(
        PAYPAL_API_BASE_URL,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      );

      if (response.data && response.data.access_token) {
        console.log('PayPal token generated successfully');
        return response.data.access_token;
      } else {
        console.error('Unexpected PayPal response format:', response.data);
        throw new Error('Invalid PayPal response format');
      }
    } catch (error) {
      console.error('PayPal API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      
      if (error.response?.data?.error === 'invalid_client') {
        console.error('PayPal client authentication failed. Please verify your credentials.');
      }
      
      throw new Error(
        `Failed to generate PayPal access token: ${
          error.response?.data?.error_description || error.message
        }`,
      );
    }
  }
}
