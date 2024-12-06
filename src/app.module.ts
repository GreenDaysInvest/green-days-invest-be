// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { WebhooksModule } from './webhooks/webhooks.module';
import configuration from './config/configuration';
console.log(process.env.NODE_ENV,"nodenv")
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' 
        ? '.env.production' 
        : '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
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
    WebhooksModule,
  ],
})
export class AppModule {}
