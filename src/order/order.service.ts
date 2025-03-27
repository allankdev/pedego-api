import {
  Injectable,
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
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto & { userId?: number }): Promise<Order> {
    const { items, ...orderData } = createOrderDto;

    let user: User | null = null;
    if (createOrderDto.userId) {
      user = await this.userRepository.findOne({ where: { id: createOrderDto.userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
    }

    const order = this.orderRepository.create({
      ...orderData,
      user: user || null,
    });

    await this.orderRepository.save(order);

    // Criar e associar os itens
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Produto ${item.productId} não encontrado`);

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        order,
      });

      orderItems.push(orderItem);
    }

    await this.orderItemRepository.save(orderItems);

    return this.findOne(order.id); // já retorna com os relacionamentos
  }

  async findAll(user: { id: number; role: string }): Promise<Order[]> {
    const where = user.role === 'ADMIN' ? {} : { user: { id: user.id } };
    return await this.orderRepository.find({
      where,
      relations: ['user', 'payment', 'deliveries', 'items', 'items.product'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'payment', 'deliveries', 'items', 'items.product'],
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

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

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'payment', 'deliveries', 'items', 'items.product'],
    });
  }
}
