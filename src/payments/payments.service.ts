import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { UserService } from '../user/user.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly userService: UserService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }

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

  async createPaymentIntent(
    userId: string,
    amount: number,
    currency = 'eur',
  ): Promise<Stripe.PaymentIntent> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.verificationStatus !== 'VERIFIED') {
      throw new Error('User is not verified');
    }

    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
    });
  }
}
