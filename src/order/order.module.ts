// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { Store } from '../store/store.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem, // ✅ Adicione isso!
      User,
      Product,
      Store,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
