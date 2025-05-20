import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { Coupon } from '../coupon/coupon.entity';
import { UserRole } from './enums/user-role.enum';
import { Store } from '../store/store.entity';
import { Subscription } from '../subscription/subscription.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  phone?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ nullable: true })
  address?: string;

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Coupon, (coupon) => coupon.createdBy)
  coupons: Coupon[];

  @ManyToOne(() => Store, (store) => store.users, { nullable: true })
  store?: Store;
}
