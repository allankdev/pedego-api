import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Request } from 'express'
import { UserService } from '../user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req.cookies?.token
          console.log('📦 Cookie Token:', token)
          return token
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    console.log('🎯 Payload decodificado:', payload)
  
    const user = await this.userService.findByIdWithStore(payload.sub)
  
    if (!user) {
      console.error('Usuário não encontrado com ID:', payload.sub)
      throw new UnauthorizedException('Usuário não encontrado')
    }
  
    return {
      sub: user.id, // 👈 precisa disso!
      role: user.role,
      storeId: user.store?.id,
      store: user.store, // ainda pode manter se necessário
    }
  }
  
}
