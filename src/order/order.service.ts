// src/order/order.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';  // Certifique-se de que CreateOrderDto está corretamente definido

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Supondo que o CreateOrderDto tenha uma propriedade 'userId' que vincula o pedido ao usuário
    const order = this.orderRepository.create({
      ...createOrderDto,
      user: { id: createOrderDto.userId }, // Associa o pedido ao usuário correto
    });
    return await this.orderRepository.save(order);
  }
}
