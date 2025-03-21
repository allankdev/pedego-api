import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeliveryDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome do destinatário', required: false })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiProperty({ example: 'Rua das Palmeiras, 45', description: 'Endereço de entrega', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '2025-03-22T14:00:00Z', description: 'Data da entrega em formato ISO 8601', required: false })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
}
