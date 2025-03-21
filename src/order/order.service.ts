import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto'; // DTO para atualização de pedido
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
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      user, // Associa o pedido ao usuário correto
    });

    try {
      return await this.orderRepository.save(order); // Salvando o pedido
    } catch (error) {
      throw new HttpException('Erro ao criar pedido', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Método para listar todos os pedidos
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.find({ relations: ['user'] }); // Retorna todos os pedidos, incluindo a relação com o usuário
    } catch (error) {
      throw new HttpException('Erro ao buscar pedidos', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Método para buscar um pedido por ID
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['user'] });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  // Método para atualizar um pedido
  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id); // Verificando se o pedido existe

    // Se necessário, você pode adicionar validações de campos específicos ou lógica de negócios aqui
    Object.assign(order, updateOrderDto); // Atualiza o pedido com os dados fornecidos no DTO

    try {
      return await this.orderRepository.save(order); // Salvando o pedido atualizado
    } catch (error) {
      throw new HttpException('Erro ao atualizar pedido', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Método para deletar um pedido
  async removeOrder(id: number): Promise<void> {
    const order = await this.findOne(id); // Verificando se o pedido existe
    try {
      await this.orderRepository.remove(order); // Removendo o pedido
    } catch (error) {
      throw new HttpException('Erro ao deletar pedido', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
