import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Product } from '../product/product.entity'; // Importando Product
import { Store } from '../store/store.entity'; // Importando Store

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @Column()
  storeId: number;

  // Relacionamento ManyToOne com Product
  @ManyToOne(() => Product, (product) => product.stock, { onDelete: 'CASCADE' })
  product: Product;

  // Relacionamento ManyToOne com Store
  @ManyToOne(() => Store, (store) => store.stocks, { onDelete: 'CASCADE' })
  store: Store;
}
