import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // Alterar o tipo da coluna password para 'text' ou aumentar o tamanho
  @Column({ type: 'varchar', length: 255 }) // Para TypeORM
  password: string;
  
  @Column({ default: 'CUSTOMER' })
  role: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
