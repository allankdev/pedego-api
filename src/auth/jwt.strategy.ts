import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Verifique o que está sendo extraído do payload aqui
    console.log('Payload JWT:', payload);  // Verifique o payload do JWT
    return {
      id: payload.sub,  // ID do usuário
      role: payload.role,  // Role do usuário
    };
  }
}
