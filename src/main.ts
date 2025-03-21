import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  setupSwagger(app); // 👈 Isso já chama a função correta

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`🚀 Aplicação rodando em http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
