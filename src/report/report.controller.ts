import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service';
import { Report } from './report.entity'; // Adicione essa linha

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async createReport(@Body() report: Report): Promise<Report> {
    return this.reportService.createReport(report.date, report.totalOrders, report.totalRevenue, report.averageOrderValue);
  }

  @Get()
  async getReports(): Promise<Report[]> {
    return this.reportService.getReports();
  }
}