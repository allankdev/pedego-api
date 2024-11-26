import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  paymentMethod: string;

  @Column()
  paymentDate: Date;

  @Column()
  amount: number;
}