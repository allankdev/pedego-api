import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/report.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PaymentModule } from './payment/payment.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { NotificationModule } from './notification/notification.module';
import { StockModule } from './stock/stock.module';
import { CouponModule } from './coupon/coupon.module'; // ✅ ADICIONADO
import { SubscriptionModule } from './subscription/subscription.module';
import { NeighborhoodModule } from './neighborhood/neighborhood.module';
import { CategoryModule } from './category/category.module';
import { OpeningHourModule } from './opening-hour/opening-hour.module';
import {CloudflareR2Module} from './cloudflare/cloudflare-r2.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '1234',
      database: process.env.DB_NAME || 'pedego',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ReportModule,
    OrderModule,
    ProductModule,
    StoreModule,
    UserModule,
    DeliveryModule,
    PaymentModule,
    AuthModule,
    GeolocationModule,
    NotificationModule,
    StockModule,
    CouponModule,
    SubscriptionModule,
    NeighborhoodModule,
    CategoryModule,
    OpeningHourModule,
    CloudflareR2Module,
     // ✅ ADICIONADO AQUI
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
