import { IsOptional, IsString, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateNeighborhoodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
