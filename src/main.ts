import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🍪 Habilita suporte a cookies
  app.use(cookieParser());

  // Prefixo global para as rotas (ex: /api/auth)
  app.setGlobalPrefix('api');

  // 🌐 CORS: permite frontend acessar com cookie
  app.enableCors({
    origin: 'http://localhost:4000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
  

  // ✅ Validação global com transformação automática de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 📚 Swagger API docs
  setupSwagger(app);

  // 🚀 Sobe o servidor na porta 3000
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`🚀 Aplicação rodando em http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
