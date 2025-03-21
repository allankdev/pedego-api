import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  subdomain: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsString()
  logoUrl?: string;
}
