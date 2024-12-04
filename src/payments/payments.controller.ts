import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

  // @UseGuards(JwtAuthGuard)
  // @Post('paypal/create-order')
  // async createPayPalOrder(
  //   @Body('userId') userId: string,
  //   @Body('amount') amount: string,
  // ) {
  //   return await this.paymentsService.createPayPalOrder(userId, amount);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('paypal/capture-order/:orderId')
  // async capturePayPalOrder(@Param('orderId') orderId: string) {
  //   return await this.paymentsService.capturePayPalOrder(orderId);
  // }

  @Post('generate-token')
  async generatePayPalToken() {
    const accessToken = await this.paymentsService.generatePayPalToken();
    return { accessToken };
  }
}
