import {
    IsOptional,
    IsString,
    IsBoolean,
    IsNumber,
    IsArray,
    ValidateNested,
  } from 'class-validator';
  import { ApiPropertyOptional } from '@nestjs/swagger';
  import { Type } from 'class-transformer';
  import { UpdateProductExtraDto } from './update-product-extra.dto';
  
  export class UpdateProductExtraGroupDto {
    @ApiPropertyOptional({ example: 'Escolha a borda' })
    @IsOptional()
    @IsString()
    title?: string;
  
    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    required?: boolean;
  
    @ApiPropertyOptional({ example: 2 })
    @IsOptional()
    @IsNumber()
    maxSelection?: number;
  
    @ApiPropertyOptional({
      type: [UpdateProductExtraDto],
      description: 'Lista de extras a serem atualizados',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductExtraDto)
    extras?: UpdateProductExtraDto[];
  }
  