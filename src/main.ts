import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  setupSwagger(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`🚀 Aplicação rodando em http://localhost:${port}`, 'Bootstrap');
}

bootstrap();