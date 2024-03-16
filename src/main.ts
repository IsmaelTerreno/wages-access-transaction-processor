import { NestFactory } from '@nestjs/core';
import { AppModule } from './wages-processor/app.module';
import * as dotenv from 'dotenv';
import * as process from 'process';
import { ValidationPipe } from "@nestjs/common";

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
  const app = await NestFactory.create(AppModule, {
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
  await app.listen(parseInt(process.env.SERVER_PORT_LISTENING) || 6030);
}
bootstrap();
