import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, // 👈 adicione isso
} from 'typeorm';
import { User } from '../user/user.entity';
import { Store } from '../store/store.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('decimal')
  discount: number;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.coupons)
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => Store)
  store: Store;

  @CreateDateColumn() // 👈 isso resolve o erro ao ordenar por createdAt
  createdAt: Date;
}
