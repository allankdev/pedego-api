import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt-payload.interface';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: (req) => {
        // Aqui tentamos obter o token do cookie
        return req.cookies.token || null;
      },
      secretOrKey: process.env.JWT_SECRET,  // Aqui você passa a chave secreta
    });
  }

  async validate(payload: JwtPayload) {
    // Aqui você pode verificar o usuário com base no ID (payload.sub)
    return this.authService.validateUserById(payload.sub);
  }
}
