import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Store } from '../store/store.entity';
import { Product } from '../product/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Store, (store) => store.categories, { onDelete: 'CASCADE' })
  store: Store;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
