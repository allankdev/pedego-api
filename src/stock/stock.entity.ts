import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number; // ou usar ManyToOne para Product

  @Column()
  quantity: number;

  @Column()
  storeId: number; // substitui restaurantId
}
