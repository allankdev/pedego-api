import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { Store } from '../store/store.entity';
import { Neighborhood } from '../neighborhood/neighborhood.entity';
import { Stock } from '../stock/stock.entity';
import { ProductExtraModule } from '../product-extra/product-extra.module';
import { UserModule } from '../user/user.module';
import { Coupon } from '../coupon/coupon.entity';
import { Payment } from '../payment/payment.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      User,
      Product,
      Store,
      Neighborhood,
      Stock,
      Coupon,
      Payment,
    ]),
    ProductExtraModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '90d' },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
