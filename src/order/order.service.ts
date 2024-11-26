// src/order/order.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto'; // Certifique-se de que CreateOrderDto está corretamente definido
import { User } from '../user/user.entity'; // Para validar a existência do usuário

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>, // Injetando o repositório de User
  ) {}

  // Método para criar um pedido
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Verificando se o usuário existe
    const user = await this.userRepository.findOne({
      where: { id: createOrderDto.userId }, // Verificando se o usuário com esse ID existe
    });

    if (!user) {
      throw new HttpException(
        'Usuario não encontrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      user, // Associa o pedido ao usuário correto
    });

    try {
      return await this.orderRepository.save(order); // Salvando o pedido
    } catch (error) {
      throw new HttpException(
        'Erro ao criar pedido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para listar todos os pedidos
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find(); // Retorna todos os pedidos
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar pedido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
