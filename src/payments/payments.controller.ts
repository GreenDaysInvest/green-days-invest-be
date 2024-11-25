import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-customer')
  async createCustomer(@Body('userId') userId: string) {
    await this.paymentsService.createCustomer(userId);
    return { message: 'Stripe customer created' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-intent')
  async createPaymentIntent(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      userId,
      amount,
    );
    return { clientSecret: paymentIntent.client_secret };
  }
}
