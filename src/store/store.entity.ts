// src/store/store.entity.ts
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

@Entity()
export class Store {
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

  @Column({ nullable: true })
  deliveryTime: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderValue: number;

  @Column({ default: 'medium' })
  printFontSize: string;

  @Column({ default: '80mm' })
  printPaperSize: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  paymentMethods: string[]; // 💳 Formas de pagamento aceitas

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Neighborhood, (neighborhood) => neighborhood.store)
  neighborhoods: Neighborhood[];

  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];

  @OneToMany(() => OpeningHour, (hour) => hour.store)
  openingHours: OpeningHour[];
}
