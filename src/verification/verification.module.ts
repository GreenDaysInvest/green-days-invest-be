import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, UserModule, ConfigModule.forRoot()],
  providers: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
