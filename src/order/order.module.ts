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
import { UserModule } from '../user/user.module'; // ✅ necessário para injetar UserService
import { Coupon } from '../coupon/coupon.entity';


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
    ]),
    ProductExtraModule,
    UserModule, // ✅ aqui estava faltando
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
