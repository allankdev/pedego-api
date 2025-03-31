// src/coupon/dto/update-coupon.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCouponDto {
  @ApiProperty({ example: 'DESCONTO10', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
