// src/report/report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column('int')
  totalOrders: number;

  @Column('float')
  totalRevenue: number;

  @Column('float')
  averageOrderValue: number;
}
