import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  // Cria uma assinatura trial (30 dias) somente se não houver NENHUMA assinatura registrada
  async createTrial(userId: number): Promise<Subscription> {
    const existing = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (existing) return existing;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const trial = this.subscriptionRepository.create({
      userId,
      status: SubscriptionStatus.TRIAL,
      expiresAt,
    });

    return this.subscriptionRepository.save(trial);
  }

  // Busca a assinatura válida mais recente do usuário
  async findByUserId(userId: number): Promise<Subscription | null> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!subscriptions.length) return null;

    const now = new Date();

    // 1. Retorna a mais recente assinatura válida (não expirada nem EXPIRED)
    for (const sub of subscriptions) {
      if (
        sub.status !== SubscriptionStatus.EXPIRED &&
        sub.expiresAt &&
        sub.expiresAt > now
      ) {
        return sub;
      }
    }

    // 2. Se todas estiverem expiradas, atualiza a mais recente se necessário
    const latest = subscriptions[0];
    if (
      latest.expiresAt < now &&
      latest.status !== SubscriptionStatus.EXPIRED
    ) {
      latest.status = SubscriptionStatus.EXPIRED;
      return this.subscriptionRepository.save(latest);
    }

    return latest;
  }

  // Lista todas as assinaturas (para SUPER_ADMIN)
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  // Expira manualmente a assinatura de um usuário
  async expireSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    if (!subscription) {
      throw new NotFoundException(`Assinatura do usuário ${userId} não encontrada`);
    }

    subscription.status = SubscriptionStatus.EXPIRED;
    return this.subscriptionRepository.save(subscription);
  }

  // Atualiza assinatura existente para plano pago
  async upgradeSubscription(
    userId: number,
    plan: 'MONTHLY' | 'YEARLY',
  ): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    if (!subscription) {
      throw new NotFoundException(`Assinatura do usuário ${userId} não encontrada`);
    }

    const newExpiration = new Date();
    if (plan === 'MONTHLY') {
      newExpiration.setMonth(newExpiration.getMonth() + 1);
    } else {
      newExpiration.setFullYear(newExpiration.getFullYear() + 1);
    }

    subscription.status =
      plan === 'MONTHLY' ? SubscriptionStatus.MONTHLY : SubscriptionStatus.YEARLY;
    subscription.expiresAt = newExpiration;

    return this.subscriptionRepository.save(subscription);
  }

  // Expira todas as assinaturas trial vencidas
  async checkAndExpireSubscriptions(): Promise<{ updated: number }> {
    const now = new Date();
    const subscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.TRIAL },
    });

    let updated = 0;

    for (const sub of subscriptions) {
      if (sub.expiresAt < now) {
        sub.status = SubscriptionStatus.EXPIRED;
        await this.subscriptionRepository.save(sub);
        updated++;
      }
    }

    return { updated };
  }
}
