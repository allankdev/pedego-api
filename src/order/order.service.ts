import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../user/user.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';
import { Store } from '../store/store.entity';
import { Neighborhood } from '../neighborhood/neighborhood.entity';
import { Stock } from '../stock/stock.entity';
import { ProductExtra } from '../product-extra/product-extra.entity';
import { UserService } from '../user/user.service';
import { Coupon } from '../coupon/coupon.entity';
import { Payment } from '../payment/payment.entity';
import { startOfDay, endOfDay } from 'date-fns';
import { Not, IsNull } from 'typeorm' 


import {
  PaymentMethod,  
  PaymentStatus,
  PaymentType,
} from '../payment/payment.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,

    @InjectRepository(Store)
    private storeRepository: Repository<Store>,

    @InjectRepository(Neighborhood)
    private neighborhoodRepository: Repository<Neighborhood>,

    @InjectRepository(ProductExtra)
    private productExtraRepository: Repository<ProductExtra>,

    private readonly userService: UserService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto & { userId?: number }): Promise<Order> {
    const {
      items,
      storeId,
      neighborhoodId,
      deliveryType,
      customerName,
      customerPhone,
      customerAddress,
      couponId,
      paymentMethod,
      scheduledAt, // 👈 incluído aqui
      ...rest
    } = createOrderDto;
  
    let user: User;
  
    if (createOrderDto.userId) {
      user = await this.userRepository.findOne({ where: { id: createOrderDto.userId } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
    } else {
      user = await this.userService.create({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      });
    }
  
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');
  
    // ✅ validação do agendamento
    let scheduledDate: Date | undefined;
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        throw new BadRequestException('A data de agendamento deve ser futura');
      }
    }
  
    let total = 0;
    let discountValue = 0;
    const orderItems: OrderItem[] = [];
  
    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) throw new NotFoundException(`Produto ${item.productId} não encontrado`);
  
      if (product.hasStockControl) {
        const stock = await this.stockRepository.findOne({
          where: { productId: product.id, storeId: store.id },
        });
        if (!stock) throw new NotFoundException(`Estoque do produto ${product.name} não encontrado`);
        if (stock.quantity < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente para o produto ${product.name}`);
        }
  
        stock.quantity -= item.quantity;
        await this.stockRepository.save(stock);
  
        if (stock.quantity <= 0 && product.available) {
          product.available = false;
          await this.productRepository.save(product);
        }
      }
  
      const extras = item.extraIds?.length
        ? await this.productExtraRepository.find({ where: { id: In(item.extraIds) } })
        : [];
  
      total += Number(product.price) * item.quantity;
      for (const extra of extras) {
        total += Number(extra.price) * item.quantity;
      }
  
      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        extras,
        unitPrice: Number(product.price),
      });
  
      orderItems.push(orderItem);
    }
  
    let neighborhood: Neighborhood | undefined;
    if (deliveryType === 'entrega' && neighborhoodId) {
      neighborhood = await this.neighborhoodRepository.findOne({ where: { id: neighborhoodId } });
      if (!neighborhood) throw new NotFoundException('Bairro não encontrado');
      total += Number(neighborhood.deliveryFee);
    }
  
    let coupon: Coupon | undefined;
    if (couponId) {
      coupon = await this.couponRepository.findOne({ where: { id: couponId } });
      if (!coupon) throw new NotFoundException('Cupom não encontrado');
      if (!coupon.active) throw new BadRequestException('Cupom inativo');
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new BadRequestException('Cupom expirado');
      }
  
      discountValue = (total * Number(coupon.discount)) / 100;
      total -= discountValue;
    }
  
    const order = this.orderRepository.create({
      ...rest,
      customerName,
      customerPhone,
      customerAddress,
      user,
      store,
      total,
      discountAmount: discountValue,
      items: orderItems,
      deliveryType,
      neighborhood,
      coupon,
      paymentMethod,
      scheduledAt: scheduledDate || null, // 👈 salva o agendamento
    });
  
    const savedOrder = await this.orderRepository.save(order);
  
    const payment = this.orderRepository.manager.create(Payment, {
      amount: total,
      paymentMethod,
      status: PaymentStatus.PENDING,
      type: PaymentType.ORDER,
      order: savedOrder,
    });
  
    await this.orderRepository.manager.save(payment);
  
    savedOrder.payment = payment;
    await this.orderRepository.save(savedOrder);
  
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
      item.extras?.forEach(extra => {
        console.log(`  • Extra: ${extra.name} (+R$ ${extra.price})`);
      });
    }
    console.log(`Total: R$ ${Number(order.total).toFixed(2)}`);
    console.log('===========================');
  }

  async findAll(user: { id: number; role: string }): Promise<Order[]> {
    const where = user.role === 'ADMIN' ? {} : { user: { id: user.id } };
    return await this.orderRepository.find({
      where,
      relations: [
        'user',
        'payment',
        'items',
        'items.product',
        'items.extras',
        'neighborhood',
        'coupon',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(user: { role: string; store?: { id: number } }): Promise<Order[]> {
    if (user.role !== 'ADMIN' || !user.store?.id) {
      throw new ForbiddenException('Apenas administradores de loja podem acessar esta rota.');
    }

    return await this.orderRepository.find({
      where: { store: { id: user.store.id } },
      relations: [
        'user',
        'payment',
        'items',
        'items.product',
        'items.extras',
        'neighborhood',
        'coupon',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'user',
        'payment',
        'items',
        'items.product',
        'items.extras',
        'neighborhood',
        'coupon',
      ],
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async cancelOrder(id: number, user: { id: number; role: string }): Promise<Order> {
    const order = await this.findOne(id);
    const isAdmin = user.role === 'ADMIN';
    const isOwner = order.user?.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Você não pode cancelar este pedido.');
    }

    if (order.status !== OrderStatus.PENDENTE) {
      throw new BadRequestException('Apenas pedidos pendentes podem ser cancelados.');
    }

    order.status = OrderStatus.CANCELADO;
    return await this.orderRepository.save(order);
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: [
        'user',
        'payment',
        'items',
        'items.product',
        'items.extras',
        'neighborhood',
        'coupon',
      ],
      order: { createdAt: 'DESC' },
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
      .andWhere('order.status != :status', { status: 'cancelado' }) // 👈 aqui filtra os cancelados
      .groupBy('order.customerName')
      .addGroupBy('order.customerPhone')
      .orderBy('SUM(order.total)', 'DESC')
      .getRawMany();
  }

  async getSalesStats(storeId: number, startDate?: string, endDate?: string) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.total)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT order.customerPhone)', 'uniqueCustomers')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status != :status', { status: 'cancelado' })
  
    if (startDate && endDate) {
      query.andWhere('order.createdAt BETWEEN :start AND :end', {
        start: new Date(startDate),
        end: new Date(endDate),
      })
    }
  
    const result = await query.getRawOne()
  
    return {
      totalOrders: parseInt(result.totalOrders),
      totalRevenue: parseFloat(result.totalRevenue || 0),
      uniqueCustomers: parseInt(result.uniqueCustomers),
    }
  }
  async getTopProductsByStore(storeId: number, limit = 5) {
    if (!storeId) throw new NotFoundException('Loja não encontrada');
  
    const result = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.product', 'product')
      .innerJoin('orderItem.order', 'order')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'quantity')
      .addSelect('SUM(orderItem.quantity * orderItem.unitPrice)', 'total') // ✅ soma total em reais
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELADO })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('quantity', 'DESC')
      .limit(limit)
      .getRawMany();
  
    return result.map(item => ({
      productId: Number(item.productId),
      productName: item.productName,
      quantity: Number(item.quantity),
      total: Number(item.total), // garante que vem como número no frontend
    }));
  }

  async getDailySalesByStore(storeId: number, startDate?: string, endDate?: string) {
    if (!storeId) throw new NotFoundException('Loja não encontrada');
  
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('day', order.createdAt)", 'date')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('SUM(order.total)', 'total')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELADO })
      .groupBy("DATE_TRUNC('day', order.createdAt)")
      .orderBy('date', 'ASC');
  
    if (startDate && endDate) {
      query.andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate)),
      });
    }
  
    const raw = await query.getRawMany();
  
    return raw.map((item) => ({
      date: item.date,
      orders: Number(item.orders),
      total: Number(item.total),
    }));
  }


  async findScheduledOrdersByStore(storeId: number): Promise<Order[]> {
    if (!storeId) throw new NotFoundException('Loja não encontrada')
  
    return this.orderRepository.find({
      where: {
        store: { id: storeId },
        scheduledAt: Not(IsNull()), // apenas pedidos com data agendada
        status: Not(OrderStatus.CANCELADO), // excluir cancelados
      },
      relations: [
        'user',
        'payment',
        'items',
        'items.product',
        'items.extras',
        'neighborhood',
        'coupon',
      ],
      order: { scheduledAt: 'ASC' }, // ordenar do mais próximo para o mais distante
    })
  }

}
