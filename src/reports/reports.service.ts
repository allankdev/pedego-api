import { Injectable } from '@nestjs/common';
import { Between, Repository, Not, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Order, OrderStatus } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Payment, PaymentStatus } from '../payment/payment.entity';
import { Neighborhood } from '../neighborhood/neighborhood.entity';
import { Stock } from '../stock/stock.entity';
import { Product } from '../product/product.entity';
import { zonedTimeToUtc } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';
import { getDateRange } from '../utils/getDateRange';






@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Stock)
private readonly stockRepository: Repository<Stock>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
   
    @InjectRepository(Product)
private readonly productRepository: Repository<Product>,


    @InjectRepository(Neighborhood)
    private readonly neighborhoodRepository: Repository<Neighborhood>,
  ) {}

  async getSalesSummary(storeId: number, from?: string, to?: string) {
    const timeZone = 'America/Sao_Paulo';
  
    const offsetMs = 3 * 60 * 60 * 1000; // GMT-3 manual

    const fromDate = from
      ? new Date(new Date(from + 'T00:00:00').getTime() + offsetMs)
      : undefined;
    
    const toDate = to
      ? new Date(new Date(to + 'T23:59:59').getTime() + offsetMs)
      : undefined;
    
  
    const where: any = { store: { id: storeId } };
    if (fromDate && toDate) {
      where.createdAt = Between(fromDate, toDate);
    }
  
    const orders = await this.orderRepository.find({
      where,
      relations: ['neighborhood', 'payment'],
    });

    const totalOrders = orders.length;
    const ordersByStatus = {
      entregue: 0,
      em_producao: 0,
      pendente: 0,
      cancelado: 0,
    };

    const paymentMethods = {
      pix: 0,
      dinheiro: 0,
      cartao_credito: 0,
      cartao_debito: 0,
      vale_refeicao: 0,
      stripe: 0,
    };

    const ordersPerDay: Record<string, number> = {};
    const ordersByNeighborhood: Record<string, number> = {};

    let totalRevenue = 0;

    for (const order of orders) {
      ordersByStatus[order.status]++;

      const dateKey = order.createdAt.toISOString().split('T')[0];
      ordersPerDay[dateKey] = (ordersPerDay[dateKey] || 0) + 1;

      const neighborhood = order.neighborhood?.name || 'Desconhecido';
      ordersByNeighborhood[neighborhood] =
        (ordersByNeighborhood[neighborhood] || 0) + 1;

      if (order.payment?.status === PaymentStatus.PAID) {
        totalRevenue += Number(order.total);
        const method = order.payment.paymentMethod;
        if (method in paymentMethods) {
          paymentMethods[method]++;
        }
      }
    }

    const averageOrderValue =
      totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageOrderValue,
      paymentMethods,
      ordersPerDay: Object.entries(ordersPerDay).map(([date, count]) => ({
        date,
        count,
      })),
      ordersByNeighborhood: Object.entries(ordersByNeighborhood).map(
        ([name, count]) => ({
          neighborhood: name,
          count,
        }),
      ),
    };
  }

  async getTopProducts(storeId: number, from?: string, to?: string) {
    const { fromDate, toDate } = getDateRange(from, to);


    const query = this.orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select('product.id', 'product_id')
      .addSelect('product.name', 'product_name')
      .addSelect('SUM(item.quantity)', 'quantity_sold')
      .addSelect('SUM(item.unitPrice * item.quantity)', 'total_revenue')      
      .where('order.storeId = :storeId', { storeId });

    if (fromDate && toDate) {
      query.andWhere('order.createdAt BETWEEN :from AND :to', {
        from: fromDate,
        to: toDate,
      });
    }

    query.groupBy('product.id, product.name').orderBy('quantity_sold', 'DESC');

    const results = await query.getRawMany();

    return results.map((row) => ({
        productId: parseInt(row.product_id),
        productName: row.product_name,
        quantitySold: parseInt(row.quantity_sold),
        totalRevenue: Number(row.total_revenue),
      }));
      
  }
  async getCustomersRanking(storeId: number, from?: string, to?: string) {
    const { fromDate, toDate } = getDateRange(from, to);
  
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('order.customerName', 'customer_name')
      .addSelect('order.customerPhone', 'customer_phone')
      .addSelect('COUNT(order.id)', 'total_orders')
      .addSelect('SUM(order.total)', 'total_spent')
      .addSelect('MAX(neighborhood.name)', 'top_neighborhood')
      .leftJoin('order.neighborhood', 'neighborhood')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.customerPhone IS NOT NULL')
      .andWhere('order.status != :status', { status: 'cancelado' });
  
    if (fromDate && toDate) {
      query.andWhere('order.createdAt BETWEEN :from AND :to', {
        from: fromDate,
        to: toDate,
      });
    }
  
    query
      .groupBy('order.customerName, order.customerPhone')
      .orderBy('total_spent', 'DESC');
  
    const result = await query.getRawMany();
  
    return result.map((row) => ({
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      totalOrders: parseInt(row.total_orders),
      totalSpent: Number(row.total_spent),
      topNeighborhood: row.top_neighborhood || null,
    }));
  }
  

  async getPaymentsSummary(storeId: number, from?: string, to?: string) {
    const { fromDate, toDate } = getDateRange(from, to);
  
    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .select('payment.paymentMethod', 'method')
      .addSelect('payment.status', 'payment_status')
      .addSelect('SUM(payment.amount)', 'amount')
      .addSelect('DATE(payment.paymentDate)', 'date')
      .where('order.storeId = :storeId', { storeId });
  
    if (fromDate && toDate) {
      qb.andWhere('payment.paymentDate BETWEEN :from AND :to', {
        from: fromDate,
        to: toDate,
      });
    }
  
    const raw = await qb
      .groupBy('method, payment_status, date')
      .getRawMany();
  
    let totalReceived = 0;
    const paymentsByMethod: Record<string, number> = {};
    const paymentsByStatus: Record<string, number> = {};
    const dailyMap: Record<string, number> = {};
  
    for (const row of raw) {
      const method = row.method;
      const status = row.payment_status;
      const amount = parseFloat(row.amount);
      const date = row.date;
  
      if (status === PaymentStatus.PAID) {
        totalReceived += amount;
      }
  
      paymentsByMethod[method] = (paymentsByMethod[method] || 0) + amount;
      paymentsByStatus[status] = (paymentsByStatus[status] || 0) + 1;
      dailyMap[date] = (dailyMap[date] || 0) + amount;
    }
  
    const dailyPayments = Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      amount: Number(amount.toFixed(2)),
    }));
  
    return {
      totalReceived: Number(totalReceived.toFixed(2)),
      paymentsByMethod,
      paymentsByStatus,
      dailyPayments,
    };
  }
  

  async getPeakHours(storeId: number, from?: string, to?: string) {
    const { fromDate, toDate } = getDateRange(from, to);

  
    const where: any = { store: { id: storeId } };
    if (fromDate && toDate) {
      where.createdAt = Between(fromDate, toDate);
    }
  
    const orders = await this.orderRepository.find({
      where,
      select: ['id', 'createdAt'],
    });
  
    const ordersByHour: Record<string, number> = {};
    const ordersByWeekday: Record<string, number> = {};
  
    for (const order of orders) {
      const hour = order.createdAt.getHours().toString().padStart(2, '0');
      const weekday = order.createdAt.toLocaleString('en-US', {
        weekday: 'long',
      });
  
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
      ordersByWeekday[weekday] = (ordersByWeekday[weekday] || 0) + 1;
    }
  
    return {
      ordersByHour: Object.entries(ordersByHour).map(([hour, count]) => ({
        hour,
        count,
      })),
      ordersByWeekday: Object.entries(ordersByWeekday).map(([weekday, count]) => ({
        weekday,
        count,
      })),
    };
  }

  async getDeliveryByNeighborhood(storeId: number, from?: string, to?: string) {
    const { fromDate, toDate } = getDateRange(from, to);

  
    const where: any = {
      store: { id: storeId },
      deliveryType: 'entrega',
      neighborhood: { id: Not(IsNull()) },
    };
  
    if (fromDate && toDate) {
      where.createdAt = Between(fromDate, toDate);
    }
  
    const orders = await this.orderRepository.find({
      where,
      relations: ['neighborhood'],
    });
  
    const statsMap: Record<string, { count: number; total: number; deliveryFee: number }> = {};
  
    for (const order of orders) {
      const neighborhood = order.neighborhood?.name || 'Desconhecido';
      const fee = Number(order.neighborhood?.deliveryFee ?? 0);
      const total = Number(order.total ?? 0);
      
  
      if (!statsMap[neighborhood]) {
        statsMap[neighborhood] = {
          count: 0,
          total: 0,
          deliveryFee: 0,
        };
      }
  
      statsMap[neighborhood].count++;
      statsMap[neighborhood].total += total;
      statsMap[neighborhood].deliveryFee += fee;
    }
  
    return Object.entries(statsMap).map(([neighborhood, data]) => ({
      neighborhood,
      ordersCount: data.count,
      deliveryFeeSum: Number(data.deliveryFee.toFixed(2)),
      averageOrderValue: Number((data.total / data.count).toFixed(2)),
    }));
  
}

async getCouponsUsage(storeId: number, from?: string, to?: string) {
    const { fromDate, toDate } = getDateRange(from, to);
  
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.coupon', 'coupon')
      .select('coupon.code', 'couponCode')
      .addSelect('COUNT(order.id)', 'usage_count')
      .addSelect('SUM(order.discountAmount)', 'total_discount')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.coupon IS NOT NULL')
      .andWhere('order.status != :status', { status: 'cancelado' });
  
    if (fromDate && toDate) {
      query.andWhere('order.createdAt BETWEEN :from AND :to', {
        from: fromDate,
        to: toDate,
      });
    }
  
    query.groupBy('coupon.code').orderBy('usage_count', 'DESC');
  
    const results = await query.getRawMany();
  
    return results.map((row) => ({
      couponCode: row.couponCode,
      usageCount: parseInt(row.usage_count),
      totalDiscountGiven: Number(row.total_discount ?? 0),
    }));
  }
  
  async getLowStock(storeId: number) {
    const THRESHOLD = 5; // valor padrão fixo usado internamente
  
    const stocks = await this.stockRepository.find({
      where: { store: { id: storeId } },
      relations: ['product'],
    });
  
    const result = stocks
      .filter(
        (stock) =>
          stock.product?.hasStockControl &&
          stock.quantity <= THRESHOLD
      )
      .map((stock) => ({
        productId: stock.product.id,
        productName: stock.product.name,
        quantity: stock.quantity,
        hasStockControl: stock.product.hasStockControl,
      }));
  
    return result;
  }
  

  
  
  
}
