import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app) {
  const config = new DocumentBuilder()
    .setTitle('Pedego API')
    .setDescription('Documentação da API Pedego')
    .setVersion('1.0')
    .addBearerAuth( // 🔐 Isso ativa o botão "Authorize"
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // 🔑 nome usado para referenciar nos controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
