import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';
import { VerificationService } from 'src/verification/verification.service';
import { UserService } from 'src/user/user.service';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  controllers: [StripeWebhookController],
  providers: [VerificationService, UserService, StripeWebhookService],
})
export class StripeWebhookModule {}
