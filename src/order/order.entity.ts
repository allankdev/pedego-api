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
import { Delivery } from '../delivery/delivery.entity';
import { Payment } from '../payment/payment.entity';
import { OrderItem } from './order-item.entity';
import { Store } from '../store/store.entity'; // ✅ NOVO

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

  @Column({ type: 'enum', enum: ['pix', 'dinheiro', 'cartao'] })
  paymentMethod: 'pix' | 'dinheiro' | 'cartao';

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

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  deliveries: Delivery[];

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  @JoinColumn()
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
