import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🍪 Suporte a cookies
  app.use(cookieParser());

  // 🔄 Stripe Webhook precisa do rawBody na rota específica
  app.use('/api/webhook/stripe', bodyParser.raw({ type: 'application/json' }));

  // 🌐 CORS
  app.enableCors({
    origin: 'http://localhost:4000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // Prefixo global
  app.setGlobalPrefix('api');

  // ✅ Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 📚 Swagger
  setupSwagger(app);

  // 🚀 Inicia
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`🚀 Aplicação rodando em http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
