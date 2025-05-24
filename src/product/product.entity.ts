import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { Category } from '../category/category.entity';
import { ProductExtraGroup } from '../product-extra/product-extra-group.entity';
import { Stock } from '../stock/stock.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @Column({ default: true })
  available: boolean;

  @Column({ default: 0 })
  position: number;

  @Column({ nullable: true })
  imageId?: string;

  @Column({ default: false })
  hasStockControl: boolean;

  @Column({ default: 0, nullable: true })
  stockQuantity: number;

  // ✅ NOVOS CAMPOS PARA CONTROLE DE DIAS DA SEMANA
  @Column({ default: false })
  hasDayControl: boolean; // Se o produto tem controle por dias da semana

  @Column('simple-array', { nullable: true })
  availableDays: number[]; // Array com os dias da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)

  @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
  store: Store;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @OneToMany(() => ProductExtraGroup, (group) => group.product, {
    cascade: true,
  })
  extraGroups: ProductExtraGroup[];

  @OneToMany(() => Stock, (stock) => stock.product, { cascade: true })
  stock: Stock[];
}