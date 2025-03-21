import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export class CreateUserDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  role: UserRole;
}
