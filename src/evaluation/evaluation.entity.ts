import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurantId: number;

  @Column()
  deliveryId: number;

  @Column()
  rating: number;

  @Column()
  comment: string;
}