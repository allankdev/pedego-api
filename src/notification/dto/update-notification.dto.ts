import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationDto {
  @ApiProperty({ example: 'Pedido atualizado!', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ example: 'info', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}
