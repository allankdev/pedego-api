// create-product-extra.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductExtraDto {
  @ApiProperty({ example: 'Borda recheada', description: 'Nome do extra' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 5.0, description: 'Preço do extra' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'Borda de catupiry', description: 'Descrição do extra' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: true, description: 'Se o extra está disponível' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  available?: boolean;
}
