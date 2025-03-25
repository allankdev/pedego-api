// src/subscription/subscription.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  // Cria uma assinatura trial (30 dias)
  async createTrial(userId: number): Promise<Subscription> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const trial = this.subscriptionRepository.create({
      userId,
      status: SubscriptionStatus.TRIAL,
      expiresAt,
    });

    return this.subscriptionRepository.save(trial);
  }

  // Busca a assinatura de um usuário
  async findByUserId(userId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({ where: { userId } });
  }

  // Lista todas as assinaturas (para SUPER_ADMIN)
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  // Expira manualmente a assinatura
  async expireSubscription(userId: number): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    if (!subscription) {
      throw new Error(`Assinatura do usuário ${userId} não encontrada`);
    }

    subscription.status = SubscriptionStatus.EXPIRED;
    return this.subscriptionRepository.save(subscription);
  }

  // Atualiza assinatura para plano pago (mensal ou anual)
  async upgradeSubscription(
    userId: number,
    plan: 'MONTHLY' | 'YEARLY',
  ): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    if (!subscription) {
      throw new Error(`Assinatura do usuário ${userId} não encontrada`);
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

  // Checa e expira assinaturas trial automaticamente
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
