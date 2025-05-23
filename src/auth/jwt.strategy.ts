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
          // Primeiro tenta cookie (admin), depois header (cliente)
          const cookieToken = req.cookies?.token
          if (cookieToken) return cookieToken

          const authHeader = req.headers['authorization']
          if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            return authHeader.replace('Bearer ', '')
          }
          return null
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    console.log('🎯 Payload decodificado:', payload)

    // Para o login mágico do cliente, pode vir { userId, role }, para admin continua { sub, role }
    const userId = payload.sub || payload.userId

    const user = await this.userService.findByIdWithStore(userId)
    if (!user) {
      console.error('Usuário não encontrado com ID:', userId)
      throw new UnauthorizedException('Usuário não encontrado')
    }

    return {
      sub: user.id,
      role: user.role,
      storeId: user.store?.id,
      store: user.store,
    }
  }
}
