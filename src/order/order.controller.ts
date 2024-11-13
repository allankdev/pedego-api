// src/order/order.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto'; // Assumindo que você tem o DTO

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() orderData: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(orderData);
  }
}
