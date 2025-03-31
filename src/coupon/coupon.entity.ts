// src/coupon/coupon.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Store } from '../store/store.entity';


@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('decimal')
  discount: number; // em reais ou percentual, você escolhe

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.coupons)
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => Store)
store: Store;
}
