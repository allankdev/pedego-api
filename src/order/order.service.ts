// src/order/order.service.ts
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
import { Store } from '../store/store.entity';
import { Neighborhood } from '../neighborhood/neighborhood.entity';

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

    @InjectRepository(Store)
    private storeRepository: Repository<Store>,

    @InjectRepository(Neighborhood)
    private neighborhoodRepository: Repository<Neighborhood>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto & { userId?: number }): Promise<Order> {
    const { items, storeId, neighborhoodId, deliveryType, ...orderData } = createOrderDto;

    let user: User | null = null;
    if (createOrderDto.userId) {
      user = await this.userRepository.findOne({ where: { id: createOrderDto.userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
    }

    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    // Calcula o total do pedido antes de salvar
    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Produto ${item.productId} não encontrado`);

      total += Number(product.price) * item.quantity;

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
      });

      orderItems.push(orderItem);
    }

    let neighborhood: Neighborhood | undefined;
    if (deliveryType === 'entrega' && neighborhoodId) {
      neighborhood = await this.neighborhoodRepository.findOne({ where: { id: neighborhoodId } });
      if (!neighborhood) throw new NotFoundException('Bairro não encontrado');
      total += Number(neighborhood.deliveryFee);
    }

    const order = this.orderRepository.create({
      ...orderData,
      user: user || null,
      store,
      total,
      items: orderItems,
      deliveryType,
      neighborhood,
    });

    const savedOrder = await this.orderRepository.save(order);

    if (store.autoPrint) {
      await this.printOrder(savedOrder);
    }

    return await this.findOne(savedOrder.id);
  }

  private async printOrder(order: Order) {
    console.log('🖨️ Impressão Automática de Pedido');
    console.log(`Pedido #${order.id} - Cliente: ${order.customerName}`);
    console.log('Itens:');
    for (const item of order.items) {
      console.log(`- ${item.product.name} x${item.quantity}`);
    }
    console.log(`Total: R$ ${order.total?.toFixed(2)}`);
    console.log('===========================');
  }

  async findAll(user: { id: number; role: string }): Promise<Order[]> {
    const where = user.role === 'ADMIN' ? {} : { user: { id: user.id } };
    return await this.orderRepository.find({
      where,
      relations: ['user', 'payment', 'items', 'items.product'],
    });
  }

  async findByStore(user: { role: string; store?: { id: number } }): Promise<Order[]> {
    if (user.role !== 'ADMIN' || !user.store?.id) {
      throw new ForbiddenException('Apenas administradores de loja podem acessar esta rota.');
    }

    return await this.orderRepository.find({
      where: { store: { id: user.store.id } },
      relations: ['user', 'payment', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'payment', 'items', 'items.product'],
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
      relations: ['user', 'payment', 'items', 'items.product'],
    });
  }

  async getCustomerRankingByStore(storeId: number) {
    if (!storeId) throw new NotFoundException('Loja não encontrada');

    return await this.orderRepository
      .createQueryBuilder('order')
      .select('order.customerName', 'name')
      .addSelect('order.customerPhone', 'phone')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('SUM(order.total)', 'totalSpent')
      .where('order.storeId = :storeId', { storeId })
      .groupBy('order.customerName')
      .addGroupBy('order.customerPhone')
      .orderBy('SUM(order.total)', 'DESC')
      .getRawMany();
  }
}