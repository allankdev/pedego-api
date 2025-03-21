import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    example: 'Relatório de Vendas',
    description: 'Título do relatório',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Relatório detalhado das vendas do último mês.',
    description: 'Conteúdo principal do relatório',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: '2025-03-21T10:00:00Z',
    description: 'Data do relatório em formato ISO 8601',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
