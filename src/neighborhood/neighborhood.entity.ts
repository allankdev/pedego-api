import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Store } from '../store/store.entity';

@Entity()
export class Neighborhood {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 }) // taxa de entrega
  deliveryFee: number;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Store, (store) => store.neighborhoods, { onDelete: 'CASCADE' })
  store: Store;
}
