// src/auth/jwt.strategy.ts
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
          const cookieToken = req.cookies?.token
          if (cookieToken) {
            console.log('🔵 [JwtStrategy] Token extraído do cookie:', cookieToken)
            return cookieToken
          }
          const authHeader = req.headers['authorization']
          if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '')
            console.log('🟢 [JwtStrategy] Token extraído do header Authorization:', token)
            return token
          }
          console.log('🟡 [JwtStrategy] Nenhum token encontrado na requisição!')
          return null
        },
      ]),
      // ✅ Correto: Usa process.env.JWT_SECRET para verificação
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    console.log('🎯 [JwtStrategy] Entrou no validate() da JwtStrategy', payload);

    if (!payload) {
      console.error('❌ [JwtStrategy] Payload do token não recebido!');
      throw new UnauthorizedException('Token inválido (payload vazio)')
    }

    const userId = payload.sub || payload.userId
    console.log('🔍 [JwtStrategy] userId resolvido:', userId)

    if (!userId) {
      console.error('❌ [JwtStrategy] Nenhum userId encontrado no payload:', payload)
      throw new UnauthorizedException('Token sem userId/sub')
    }

    const user = await this.userService.findByIdWithStore(userId)
    if (!user) {
      console.error('❌ [JwtStrategy] Usuário não encontrado no banco com ID:', userId)
      throw new UnauthorizedException('Usuário não encontrado')
    }

    console.log('🟩 [JwtStrategy] Usuário retornado:', {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      store: user.store?.id,
    })

    return {
      id: user.id,
      sub: user.id,
      role: user.role,
      storeId: user.store?.id,
      store: user.store,
    }
  }
}