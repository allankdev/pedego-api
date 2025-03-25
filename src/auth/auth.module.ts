import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

import { UserModule } from '../user/user.module';
import { StoreModule } from '../store/store.module'; // ✅
import { SubscriptionModule } from '../subscription/subscription.module'; // ✅ se estiver usando assinatura

@Module({
  imports: [
    UserModule,
    StoreModule, // ✅ Adicione aqui
    SubscriptionModule, // ✅ Se estiver usando o service para assinatura
    JwtModule.register({
      secret: 'mysecretkey', // Substitua por uma chave segura
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
