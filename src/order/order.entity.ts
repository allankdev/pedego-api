// src/order/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Delivery } from '../delivery/delivery.entity'; // Importando Delivery

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product: string;

  @Column('decimal')
  price: number;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  deliveries: Delivery[];  // Relacionamento OneToMany com Delivery
}
