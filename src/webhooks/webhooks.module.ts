import { Module } from '@nestjs/common';
import { WebhookController } from './webhooks.controller';
import { StripeService } from './stripe.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [WebhookController],
  providers: [StripeService],
})
export class WebhooksModule {}
