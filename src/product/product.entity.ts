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

  @Column({ nullable: true })
  imageId?: string;

  @Column({ default: false })
  hasStockControl: boolean;

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
}
