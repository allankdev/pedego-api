import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';
import { Coupon } from '../coupon/coupon.entity';
import { UserRole } from './enums/user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  phone?: string;  // O telefone é obrigatório para clientes

  @Column({ nullable: true, unique: true })
  email?: string;  // O email é opcional, mas necessário para ADMIN (lojas)

  @Column({ nullable: true })
  password?: string;  // A senha é opcional, mas necessária para ADMIN (lojas)

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;  // O papel do usuário, podendo ser CUSTOMER ou ADMIN

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Coupon, (coupon) => coupon.createdBy)
  coupons: Coupon[];
}
