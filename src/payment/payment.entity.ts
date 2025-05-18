import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { Order } from '../order/order.entity';

// ✅ Métodos de pagamento aceitos na plataforma
export enum PaymentMethod {
  PIX = 'pix',
  DINHEIRO = 'dinheiro',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  VALE_REFEICAO = 'vale_refeicao',
  STRIPE = 'stripe',
}

// ✅ Status do pagamento
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// ✅ Tipo de pagamento (pedido ou assinatura)
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
  userId?: number;

  @Column({ nullable: true })
  stripeTransactionId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;
}
