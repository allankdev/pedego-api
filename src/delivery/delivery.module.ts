// src/delivery/delivery.module.ts
import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './delivery.entity';
import { Order } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, Order])],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
