import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { PaymentMethod, PaymentStatus } from './dto/create-payment.dto';

export enum PaymentType {
  ORDER = 'ORDER',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @OneToOne(() => Order, (order) => order.payment, { nullable: true, onDelete: 'CASCADE' })
  order?: Order;

  @Column({ nullable: true })
  userId?: number; // usado para assinatura (vincula ao usuário)

  @Column({ nullable: true })
  stripeTransactionId?: string; // usado para controle do Stripe

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;
}
