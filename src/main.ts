import { NestFactory } from '@nestjs/core';
import { WagesModule } from './wages-processor/wages.module';
import * as dotenv from 'dotenv';
import * as process from 'process';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

/**
 * Gets the cors origin to respect the expressjs cors which is behind scenes in NestJs
 * @return Array[string]
 * @link https://github.com/expressjs/cors#configuration-options
 */
export const getCORSConfig = () => {
  const CORS_ALLOW_ORIGIN = process.env.CORS_ALLOW_ORIGIN;
  const ALLOWED_ORIGINS = CORS_ALLOW_ORIGIN.split(',');
  return ALLOWED_ORIGINS;
};

async function bootstrap() {
  const app = await NestFactory.create(WagesModule, {
    bufferLogs: true,
    rawBody: true,
    logger: ['error', 'warn', 'debug', 'log'],
    cors: {
      origin: getCORSConfig(),
      credentials: true,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Wage Access Transaction Processor API')
    .setDescription(
      'This platform allows employees in LATAM countries working for US companies to access their earned wages in real-time before payday.',
    )
    .setVersion('1.0')
    .addTag('Wages Processor')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  console.log('Server is running on port:', process.env.SERVER_PORT_LISTENING);
  await app.listen(parseInt(process.env.SERVER_PORT_LISTENING) || 6030);
}

bootstrap();
