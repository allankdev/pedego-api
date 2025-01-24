// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity'; // Importando a entidade Order

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;  // Nome do usuário

  @Column({ unique: true })
  email: string;  // Email do usuário (único)

  @Column({ unique: true })
  username: string;  // Nome de usuário (único)

  @Column()
  password: string;  // Senha do usuário

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];  // Relacionamento OneToMany com pedidos, um usuário pode ter vários pedidos

  @Column({ default: 'CUSTOMER' })
  role: string;  // Papel do usuário, padrão é 'CUSTOMER'
}
