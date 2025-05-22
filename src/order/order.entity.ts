import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Payment } from '../payment/payment.entity';
import { OrderItem } from './order-item.entity';
import { Store } from '../store/store.entity'; // ✅ NOVO
import { Neighborhood } from '../neighborhood/neighborhood.entity';
import { Coupon } from '../coupon/coupon.entity';
import { PaymentMethod } from '../payment/payment.entity';




export enum OrderStatus {
  PENDENTE = 'pendente',
  EM_PRODUCAO = 'em_producao',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  customerAddress: string;

  @Column({ type: 'enum', enum: ['entrega', 'retirada'] })
  deliveryType: 'entrega' | 'retirada';

  @Column({ type: 'enum', enum: PaymentMethod })
paymentMethod: PaymentMethod;

@Column({ type: 'timestamp', nullable: true })
scheduledAt?: Date;

@Column('decimal', { precision: 10, scale: 2, nullable: true })
troco?: number;


  @Column({ nullable: true })
  observations?: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDENTE,
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 }) // ✅ NOVO
  total: number;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  @ManyToOne(() => Store, (store) => store.orders, { nullable: false }) // ✅ NOVO
  store: Store;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  @JoinColumn()
  payment: Payment;

  @ManyToOne(() => Coupon, { nullable: true, eager: true })
coupon?: Coupon;

@Column('decimal', { precision: 10, scale: 2, nullable: true })
discountAmount?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Neighborhood, { nullable: true })
@JoinColumn()
neighborhood?: Neighborhood;

}
