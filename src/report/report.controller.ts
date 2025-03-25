import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo relatório (somente ADMIN)' })
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
  @ApiOperation({ summary: 'Obtém todos os relatórios (somente ADMIN)' })
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
