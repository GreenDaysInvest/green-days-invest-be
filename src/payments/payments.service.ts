import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';
import { UserService } from '../user/user.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(private readonly userService: UserService) {
    // Initialize Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    // Initialize PayPal
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );
    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }

  // Stripe customer creation logic remains unchanged
  async createCustomer(userId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.stripeCustomerId) return;

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.name} ${user.surname}`,
    });

    await this.userService.updateUser(userId, {
      stripeCustomerId: customer.id,
    });
  }

  // Stripe payment intent creation logic remains unchanged
  async createPaymentIntent(
    userId: string,
    amount: number,
    currency = 'eur',
  ): Promise<Stripe.PaymentIntent> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.isVerified) {
      throw new ConflictException('User is not verified');
    }

    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
    });
  }

  // PayPal order creation
  async createPayPalOrder(
    userId: string,
    amount: string,
    currency = 'EUR',
  ): Promise<string> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    });

    const response = await this.paypalClient.execute(request);
    return response.result.id; // Return the PayPal order ID
  }

  // PayPal order capture
  async capturePayPalOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await this.paypalClient.execute(request);
    return response.result; // Return captured payment details
  }
}
