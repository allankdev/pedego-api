// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity'; // Importando a entidade Order

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ unique: true }) // Garantindo que o email seja único
  username: string;  // Adicionando o campo username

  @Column()
  password: string;

  @OneToMany(() => Order, (order) => order.user)  // Relacionamento OneToMany com Order
  orders: Order[];  // Um usuário pode ter muitos pedidos

  @Column({ default: 'CUSTOMER' }) // Pode ser 'ADMIN' ou 'CUSTOMER'
  role: string;
}
