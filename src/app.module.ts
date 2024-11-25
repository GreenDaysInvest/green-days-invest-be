// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ScraperModule } from './scraper/scraper.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { EmailModule } from './email/email.module';
import { BasketModule } from './basket/basket.module';
import { FlowerModule } from './flower/flower.module';
import { VerificationModule } from './verification/verification.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UserModule,
    ScraperModule,
    QuestionnaireModule,
    EmailModule,
    BasketModule,
    FlowerModule,
    VerificationModule,
    PaymentsModule,
  ],
})
export class AppModule {}
