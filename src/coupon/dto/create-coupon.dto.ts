// src/coupon/dto/create-coupon.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'DESCONTO10' })
  @IsString()
  code: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  discount: number;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
