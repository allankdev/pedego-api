import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';


dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Verifique o que está sendo extraído do payload aqui
    console.log('Payload JWT:', payload); // Verifique o payload do JWT

    const user = await this.userService.findByIdWithStore(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Retorna o usuário com a loja associada
    return {
      id: user.id,          // ID do usuário
      role: user.role,      // Role do usuário
      store: user.store,    // A loja associada ao usuário
    };
  }
}
