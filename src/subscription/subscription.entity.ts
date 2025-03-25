import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// src/subscription/subscription.entity.ts
export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  EXPIRED = 'EXPIRED', // ✅ Adiciona esse
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
