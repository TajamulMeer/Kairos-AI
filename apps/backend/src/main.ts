import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Sentry
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  if (sentryDsn && nodeEnv === 'production') {
    Sentry.init({ dsn: sentryDsn, environment: nodeEnv, tracesSampleRate: 0.1 });
  }

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGINS', '*').split(','),
    credentials: true,
  });

  // Versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (non-production)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AIRIX AI API')
      .setDescription('India\'s most intelligent AI-powered NEET preparation platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('ai', 'AI services')
      .addTag('questions', 'Question bank')
      .addTag('tests', 'Mock tests')
      .addTag('study-plans', 'Study planning')
      .addTag('analytics', 'Performance analytics')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`AIRIX AI Backend running on port ${port} [${nodeEnv}]`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
