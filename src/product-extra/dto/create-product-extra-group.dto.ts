// create-product-extra-group.dto.ts
import {
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProductExtraDto } from './create-product-extra.dto';

export class CreateProductExtraGroupDto {
  @ApiProperty({ example: 'Escolha a borda', description: 'Título do grupo de extras' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: true, description: 'Se a seleção de extras é obrigatória' })
  @IsBoolean()
  required: boolean;

  @ApiProperty({ example: 1, description: 'Número máximo de extras selecionáveis' })
  @IsNumber()
  maxSelection: number;

  @ApiProperty({ example: 1, description: 'ID do produto relacionado' })
  @IsNumber()
  productId: number;

  @ApiProperty({ type: [CreateProductExtraDto], description: 'Lista de extras do grupo' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductExtraDto)
  extras: CreateProductExtraDto[];
}
