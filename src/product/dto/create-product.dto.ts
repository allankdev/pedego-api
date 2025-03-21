import { IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  available: boolean;
}
