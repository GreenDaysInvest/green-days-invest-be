import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure CORS
  app.enableCors();
  
  // Parse raw body for webhook endpoint with verify function
  app.use(
    '/webhooks/stripe',
    express.raw({
      type: 'application/json',
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  
  // Use JSON parser for all other routes
  app.use((req, res, next) => {
    if (req.originalUrl === '/webhooks/stripe') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });
  
  await app.listen(3000);
}
bootstrap();
