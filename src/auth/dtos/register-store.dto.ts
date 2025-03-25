import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterStoreDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  storeName: string;

  @IsString()
  description: string;

  @IsString()
  subdomain: string;
}
