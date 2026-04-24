import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '../../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use(pinoHttp({ logger }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BA33 Platform API')
    .setDescription('BA33 Platform backend API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application listening on port ${port}`);
}

bootstrap();
