import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
}
