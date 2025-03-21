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
  product: string;

  @Column('decimal')
  price: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDENTE,
  })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  deliveries: Delivery[];

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  @JoinColumn() // <- Adiciona a FK do pagamento aqui
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
