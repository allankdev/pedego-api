// src/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config' // 👈 Importe estes dois

import { UserModule } from '../user/user.module'
import { StoreModule } from '../store/store.module'
import { SubscriptionModule } from '../subscription/subscription.module'

@Module({
  imports: [
    UserModule,
    StoreModule,
    SubscriptionModule,
    // ✅ CORREÇÃO: Usando registerAsync para carregar o secret do ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // 👈 Importe o ConfigModule para que o ConfigService esteja disponível
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // 👈 Obtém o valor da variável de ambiente
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], // 👈 Injete o ConfigService para que ele seja passado para useFactory
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}