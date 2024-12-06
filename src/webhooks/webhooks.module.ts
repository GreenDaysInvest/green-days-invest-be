import { Module } from '@nestjs/common';
import { WebhookController } from './webhooks.controller';
import { StripeService } from './stripe.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
  ],
  controllers: [WebhookController],
  providers: [StripeService],
})
export class WebhooksModule {}
