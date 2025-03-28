import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNeighborhoodDto {
  @ApiProperty({
    example: 'Centro',
    description: 'Nome do bairro',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 5.5,
    description: 'Taxa de entrega para o bairro',
  })
  @IsNumber()
  @Min(0)
  deliveryFee: number;
}
