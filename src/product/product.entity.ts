import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from 'typeorm';
import { Store } from '../store/store.entity';

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

  // Relacionamento: vários produtos pertencem a uma loja
  @ManyToOne(() => Store, (store) => store.products, { onDelete: 'CASCADE' })
  store: Store;
}
