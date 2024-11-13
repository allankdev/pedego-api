// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { User } from '../user/user.entity';
import { Store } from '../store/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Store])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
