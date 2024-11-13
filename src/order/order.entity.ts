// src/order/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';  // Importando a entidade User
import { Delivery } from '../delivery/delivery.entity';  // Importando a entidade Delivery

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.orders)  // Relacionamento ManyToOne com User
  user: User;  // Cada pedido pertence a um usuário

  @OneToMany(() => Delivery, (delivery) => delivery.order)  // Relacionamento OneToMany com Delivery
  deliveries: Delivery[];  // Um pedido pode ter muitas entregas
}
