import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../user/user.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Cria um novo pedido, com ou sem userId
  async createOrder(createOrderDto: CreateOrderDto & { userId?: number }): Promise<Order> {
    let user: User | null = null;
  
    if (createOrderDto.userId) {
      user = await this.userRepository.findOne({ where: { id: createOrderDto.userId } });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
    }
  
    const order = this.orderRepository.create({
      ...createOrderDto,
      user: user || null,
    });
  
    return await this.orderRepository.save(order);
  }
  

  // Lista todos os pedidos com relações
  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['user', 'payment', 'deliveries'],
    });
  }

  // Busca um pedido específico por ID
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'payment', 'deliveries'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  // Atualiza um pedido
  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    Object.assign(order, updateOrderDto);

    return await this.orderRepository.save(order);
  }

  // Remove (ou cancela) um pedido com validação de acesso
  async removeOrder(id: number, user: { id: number; role: string }): Promise<void> {
    const order = await this.findOne(id);

    const isAdmin = user.role === 'ADMIN';
    const isOwner = order.user?.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Você não pode deletar este pedido.');
    }

    if (!isAdmin && order.status !== 'pendente') {
      throw new BadRequestException('Você só pode cancelar pedidos com status pendente.');
    }

    await this.orderRepository.remove(order);
  }

  // Busca todos os pedidos de um usuário específico
  async findByUserId(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'payment', 'deliveries'],
    });
  }
}
