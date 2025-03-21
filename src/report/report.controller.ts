import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo relatório' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Relatório criado com sucesso',
    type: Report,
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createReport(@Body() createReportDto: CreateReportDto): Promise<Report> {
    try {
      return await this.reportService.createReport(createReportDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao criar relatório',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtém todos os relatórios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de relatórios retornada com sucesso',
    type: Report,
    isArray: true,
  })
  async getReports(): Promise<Report[]> {
    return this.reportService.getReports();
  }
}
