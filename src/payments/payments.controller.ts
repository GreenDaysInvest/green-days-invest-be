import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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

  @Post('generate-token')
  async generatePayPalToken() {
    const accessToken = await this.paymentsService.generatePayPalToken();
    return { accessToken };
  }
}
