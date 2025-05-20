// src/subscription/subscription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  EXPIRED = 'EXPIRED',
}

export enum SubscriptionPlan {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Column({ type: 'enum', enum: SubscriptionPlan, nullable: true })
  plan: SubscriptionPlan;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
