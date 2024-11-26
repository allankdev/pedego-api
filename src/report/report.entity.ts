import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  totalOrders: number;

  @Column()
  totalRevenue: number;

  @Column()
  averageOrderValue: number;
}