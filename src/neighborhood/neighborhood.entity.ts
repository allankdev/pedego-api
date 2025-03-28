// neighborhood.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Store } from '../store/store.entity';

@Entity()
export class Neighborhood {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 }) // ou apenas @Column() se preferir
  deliveryFee: number;

  @ManyToOne(() => Store, (store) => store.neighborhoods)
  store: Store;
}
