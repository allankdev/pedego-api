import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Product } from '../product/product.entity';
import { Neighborhood } from '../neighborhood/neighborhood.entity';
import { Category } from '../category/category.entity';
import { OpeningHour } from '../opening-hour/opening-hour.entity';
import { User } from '../user/user.entity'; 
import { Order } from '../order/order.entity';
import { Stock } from '../stock/stock.entity'; // ✅ IMPORTAÇÃO ADICIONADA

@Entity()
export class Store {

  @Column({ nullable: true })
  avatarImageId?: string;
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: 'enum',
    enum: ['entrega', 'retirada', 'ambos'],
    default: 'ambos',
  })
  operationMode: 'entrega' | 'retirada' | 'ambos';

  @Column({ default: true })
  isOpen: boolean;

  @Column({ default: false })
  autoPrint: boolean;

  @Column({ nullable: true })
  deliveryTime: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderValue: number;

  @OneToMany(() => Order, (order) => order.store) 
  orders: Order[];

  @Column({ default: 'medium' })
  printFontSize: string;

  @Column({ default: '80mm' })
  printPaperSize: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  paymentMethods: string[];

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Neighborhood, (neighborhood) => neighborhood.store)
  neighborhoods: Neighborhood[];

  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];

  @OneToMany(() => OpeningHour, (hour) => hour.store)
  openingHours: OpeningHour[];

  @OneToMany(() => User, (user) => user.store)
  users: User[];

  // Relacionamento com Stock - Agora você tem um relacionamento bidirecional
  @OneToMany(() => Stock, (stock) => stock.store)
  stocks: Stock[];  // Relacionamento com o estoque
}
