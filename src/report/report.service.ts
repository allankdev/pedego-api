import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async createReport(date: Date, totalOrders: number, totalRevenue: number, averageOrderValue: number): Promise<Report> {
    const report = new Report();
    report.date = date;
    report.totalOrders = totalOrders;
    report.totalRevenue = totalRevenue;
    report.averageOrderValue = averageOrderValue;
    return this.reportRepository.save(report);
  }

  async getReports(): Promise<Report[]> {
    return this.reportRepository.find();
  }
}