import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../product/product.entity';
import { ProductExtra } from './product-extra.entity';

@Entity()
export class ProductExtraGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: 1 })
  maxSelection: number;

  @ManyToOne(() => Product, (product) => product.extraGroups, { onDelete: 'CASCADE' })
  product: Product;

  @OneToMany(() => ProductExtra, (extra) => extra.group, { cascade: true })
  extras: ProductExtra[];
}
