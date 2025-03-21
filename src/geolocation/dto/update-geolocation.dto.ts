import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGeolocationDto {
  @ApiProperty({ example: -23.55052, description: 'Latitude do usuário' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: -46.633308, description: 'Longitude do usuário' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: 'Rua das Palmeiras, 45', description: 'Endereço do usuário', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'São Paulo', description: 'Cidade', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'SP', description: 'Estado', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Brasil', description: 'País', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '01310-100', description: 'CEP ou código postal', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;
}
