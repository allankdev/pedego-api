// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrai o token JWT do cabeçalho Authorization
      ignoreExpiration: false, // Não ignora a expiração do token (garante que o token expirado não seja aceito)
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // Chave secreta para validar o token, pode ser configurada via variável de ambiente
    });
  }

  // Este método valida o payload do JWT
  async validate(payload: any) {
    // Retorna as informações do usuário que estão dentro do payload
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
