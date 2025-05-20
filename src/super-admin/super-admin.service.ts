// src/super-admin/super-admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { Store } from '../store/store.entity';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '../subscription/subscription.entity';
import { Payment, PaymentType, PaymentMethod } from '../payment/payment.entity';
import { User } from '../user/user.entity';
import { AuditLog } from '../audit-log/audit-log.entity';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { FilterStoresDto } from './dto/filter-stores.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { generateCSV } from './utils/csv.util';
import { UserRole } from '../user/enums/user-role.enum';



@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
    @InjectRepository(Subscription) private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async getPlatformSummary() {
    const totalOrders = await this.orderRepo.count();

    const { sum: revenue } = await this.paymentRepo
    .createQueryBuilder('p')
    .innerJoin('p.order', 'o') // join com pedido
    .select('SUM(p.amount)', 'sum')
    .where('p.type = :type', { type: PaymentType.ORDER })
    .andWhere('o.status != :status', { status: 'cancelado' }) // ignora cancelados
    .getRawOne();
  

    const totalRevenue = Number(revenue) || 0;

    const stores = await this.storeRepo.find({ select: ['id', 'isSuspended'] });

    const totalStores = stores.length;
    const suspendedStores = stores.filter((s) => s.isSuspended).length;
    const activeStores = totalStores - suspendedStores;
    
    const subscriptions = await this.subscriptionRepo.find();
    const activeSubscriptions = subscriptions.filter((s) => s.status !== SubscriptionStatus.EXPIRED).length;
    const expiredTrials = subscriptions.filter((s) => s.status === SubscriptionStatus.EXPIRED).length;

    const payments = await this.paymentRepo.find();
    const paymentsByType = payments.reduce(
      (acc, p) => {
        const amount = Number(p.amount);
        if (p.type === PaymentType.ORDER) acc.pedido += amount;
        if (p.type === PaymentType.SUBSCRIPTION) acc.assinatura += amount;
        return acc;
      },
      { pedido: 0, assinatura: 0 },
    );

    return {
      totalOrders,
      totalRevenue,
      totalStores,
      activeStores,
      suspendedStores, // ✅ novo campo
      activeSubscriptions,
      expiredTrials,
      paymentsByType,
    };
    
    
  }

  async getStoresOverview() {
    const stores = await this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.orders', 'orders')
      .select([
        'store.id',
        'store.name',
        'store.subdomain',
        'store.isOpen',
        'orders.id',
        'orders.total',
        'orders.status',
      ])
      .getMany();

    return stores.map((store) => ({
      storeId: store.id,
      storeName: store.name,
      subdomain: store.subdomain,
      totalOrders: store.orders.length,
      totalRevenue: store.orders
      .filter((o) => o.status !== 'cancelado') // ✅ ignora cancelados
      .reduce((acc, o) => acc + Number(o.total || 0), 0),
          isOpen: store.isOpen,
    }));
  }

  async getSubscriptionPayments() {
    return this.paymentRepo.find({
      where: {
        type: PaymentType.SUBSCRIPTION,
        paymentMethod: PaymentMethod.STRIPE,
      },
      order: { paymentDate: 'DESC' },
    });
  }

  async suspendStore(storeId: number, actorId: number) {
    const store = await this.storeRepo.findOneOrFail({ where: { id: storeId } });
    store.isSuspended = !store.isSuspended;
    await this.storeRepo.save(store);

    await this.auditRepo.save({
      action: 'SUSPEND_STORE',
      actorId,
      targetStoreId: storeId,
      description: store.isSuspended ? 'Loja suspensa' : 'Loja reativada',
    });

    return { message: `Loja ${store.isSuspended ? 'suspensa' : 'reativada'} com sucesso.` };
  }

  async toggleUserActive(userId: number, actorId: number) {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    user.isActive = !user.isActive;
    await this.userRepo.save(user);

    await this.auditRepo.save({
      action: 'TOGGLE_USER',
      actorId,
      targetUserId: userId,
      description: user.isActive ? 'Usuário ativado' : 'Usuário desativado',
    });

    return { message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso.` };
  }

  async getAuditLogs() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async upgradeStorePlan(storeId: number, dto: UpgradeSubscriptionDto, actorId: number) {
    const adminUser = await this.userRepo.findOneOrFail({
      where: {
        role: UserRole.ADMIN,
        store: { id: storeId },
      },
      relations: ['subscription', 'store'],
    });
  
    if (!adminUser.subscription) {
      throw new Error('Usuário admin da loja não possui assinatura ativa.');
    }
  
    adminUser.subscription.plan = dto.plan;
    adminUser.subscription.status = SubscriptionStatus.ACTIVE;
    adminUser.subscription.expiresAt = this.calculateExpiration(dto.plan);
  
    await this.subscriptionRepo.save(adminUser.subscription);
  
    await this.auditRepo.save({
      action: 'UPGRADE_SUBSCRIPTION',
      actorId,
      targetStoreId: storeId,
      description: `Plano atualizado para ${dto.plan}`,
    });
  
    return { message: `Plano da loja atualizado para ${dto.plan} com sucesso.` };
  }

  private calculateExpiration(plan: SubscriptionPlan): Date {
    const now = new Date();
    if (plan === SubscriptionPlan.MONTHLY) {
      now.setMonth(now.getMonth() + 1);
    } else if (plan === SubscriptionPlan.YEARLY) {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now;
  }

  async filterStores(filters: FilterStoresDto) {
    const qb = this.storeRepo
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.users', 'user', 'user.role = :adminRole', { adminRole: UserRole.ADMIN })
      .leftJoin('user.subscription', 'subscription')
      .addSelect(['subscription.plan', 'subscription.status'])
  
    // ⚠️ Filtro por STATUS da loja
    if (filters.status) {
      switch (filters.status) {
        case 'active':
          qb.andWhere('store.isOpen = true AND store.isSuspended = false')
          break
        case 'inactive':
          qb.andWhere('store.isOpen = false AND store.isSuspended = false')
          break
        case 'suspended':
          qb.andWhere('store.isSuspended = true')
          break
      }
    }
  
    // ⚠️ Filtro por nome ou subdomínio (busca)
    if (filters.search) {
      qb.andWhere('(store.name ILIKE :search OR store.subdomain ILIKE :search)', {
        search: `%${filters.search}%`,
      })
    }
  
    const stores = await qb.getMany()
  
    // ✅ Filtro por PLANO em memória (evita problemas com join faltando)
    const filteredStores =
      filters.plan && filters.plan !== 'all'
        ? stores.filter((store) => {
            const admin = store.users.find((u) => u.role === UserRole.ADMIN)
            return admin?.subscription?.plan === filters.plan
          })
        : stores
  
    // 🧠 Garante dedução correta do plano
    return filteredStores.map((store) => {
      const admin = store.users.find((u) => u.role === UserRole.ADMIN && u.subscription)
      return {
        ...store,
        currentPlan: admin?.subscription?.plan || 'TRIAL',
      }
    })
  }
  
  

  async filterUsers(filters: FilterUsersDto) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.store', 'store')
  
    // 🎯 Filtro por função (role)
    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role })
    }
  
    // 🎯 Filtro por status ativo/inativo
    if (filters.isActive !== undefined) {
      qb.andWhere('user.isActive = :active', {
        active: filters.isActive === 'true',
      })
    }
  
    // 🎯 Filtro por loja (storeId)
    if (filters.storeId) {
      qb.andWhere('store.id = :storeId', { storeId: filters.storeId })
    }
  
    return qb.getMany()
  }
  
  
  async getChartsOverview() {
    const pedidos = await this.orderRepo
      .createQueryBuilder('o')
      .select("TO_CHAR(o.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'total')
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

      const receita = await this.paymentRepo
      .createQueryBuilder('p')
      .innerJoin('p.order', 'o') // junta com os pedidos
      .select("TO_CHAR(p.paymentDate, 'YYYY-MM')", 'month')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.type = :type', { type: PaymentType.ORDER })
      .andWhere('o.status != :status', { status: 'cancelado' }) // ignora cancelados
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

    const planos = await this.subscriptionRepo
      .createQueryBuilder('s')
      .select('s.plan', 'plan')
      .addSelect('COUNT(*)', 'total')
      .groupBy('s.plan')
      .getRawMany();

    return { pedidos, receita, planos };
  }

  async exportCSV(entity: string) {
    let data = [];

    if (entity === 'stores') data = await this.storeRepo.find();
    else if (entity === 'users') data = await this.userRepo.find();
    else if (entity === 'orders') data = await this.orderRepo.find();
    else if (entity === 'payments') data = await this.paymentRepo.find();

    return generateCSV(data);
  }

  
}
