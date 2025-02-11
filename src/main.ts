import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  console.log('Starting application...', {
    nodeEnv: process.env.NODE_ENV,
    envFile: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local',
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Add request logging middleware
  app.use((req, res, next) => {
    console.log('Incoming request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        origin: req.headers.origin
      }
    });
    next();
  });
  
  // Configure CORS based on environment
  const allowedOrigins =  [
        'https://www.cannabisrezepte24.de',
        'https://www.cannabisrezepte24.de/de',
        'https://green-days-invest.vercel.app',
        'https://green-days-invest.vercel.app/de',
        'http://localhost:3002',
        'http://localhost:3002/de',
        'http://localhost:3000'
      ];

  console.log('Configuring CORS with origins:', allowedOrigins);
  
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  const url = await app.getUrl();
  console.log(`Application is running on: ${url}`);
}

bootstrap();
