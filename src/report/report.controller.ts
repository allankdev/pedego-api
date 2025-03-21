// src/report/report.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReportService } from './report.service';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';  // Importando o DTO

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Endpoint para criar um relatório
  @Post()
  async createReport(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.reportService.createReport(createReportDto);
  }

  // Endpoint para obter todos os relatórios
  @Get()
  async getReports(): Promise<Report[]> {
    return this.reportService.getReports();
  }
}
