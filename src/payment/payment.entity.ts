import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Order } from '../order/order.entity';
import { PaymentMethod, PaymentStatus } from './dto/create-payment.dto';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE' })
  order: Order;
}
