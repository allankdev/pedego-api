import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateDeliveryDto {
  @IsNotEmpty()
  @IsString()
  recipient: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsDateString()
  deliveryDate: string;
}
