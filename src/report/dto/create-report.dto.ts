// src/report/dto/create-report.dto.ts
import { IsDateString, IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsDateString()
  date: string;

  @IsNumber()
  totalOrders: number;

  @IsNumber()
  totalRevenue: number;

  @IsNumber()
  averageOrderValue: number;
}
