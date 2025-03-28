// src/opening-hour/opening-hour.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Store } from '../store/store.entity';

@Entity()
export class OpeningHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: string; // 'segunda', 'terça', etc.

  @Column()
  open: string; // ex: '08:00'

  @Column()
  close: string; // ex: '18:00'

  @ManyToOne(() => Store, (store) => store.openingHours, { onDelete: 'CASCADE' })
  store: Store;
}
