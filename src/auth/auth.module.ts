// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
    UserModule, // Importa o módulo de usuário para acessar métodos como create e findByUsername
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Definindo a chave secreta para o JWT
      signOptions: { expiresIn: '1h' }, // Definindo a expiração do token
    }),
  ],
  providers: [
    AuthService, // Fornecendo o serviço de autenticação
    JwtStrategy, // Estratégia do JWT para autenticação
  ],
  controllers: [AuthController], // Controlador que define as rotas de login e registro
})
export class AuthModule {}
