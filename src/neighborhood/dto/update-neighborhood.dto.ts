import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateNeighborhoodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;
}
