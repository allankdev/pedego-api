// src/report/report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ default: 0, nullable: true })
  totalOrders: number;

  @Column('float', { default: 0, nullable: true })
  totalRevenue: number;

  @Column('float', { default: 0, nullable: true })
  averageOrderValue: number;
}
