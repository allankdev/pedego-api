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
      ...rest
    } = createOrderDto;

    let user: User | null = null;

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
      discountAmount: discountValue, // ✅ aqui
      items: orderItems,
      deliveryType,
      neighborhood,
      coupon,
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
      .groupBy('order.customerName')
      .addGroupBy('order.customerPhone')
      .orderBy('SUM(order.total)', 'DESC')
      .getRawMany();
  }
}
