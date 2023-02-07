import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = 7998;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Logger.log(`http://localhost:${port}`, 'bootstrap');
  await app.listen(port);
}
bootstrap();
