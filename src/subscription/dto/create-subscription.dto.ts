// src/subscription/dto/create-subscription.dto.ts
import { IsEnum, IsInt, IsDateString } from 'class-validator';
import { SubscriptionStatus } from '../subscription.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.TRIAL })
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @ApiProperty({ example: '2025-05-01T00:00:00Z' })
  @IsDateString()
  expiresAt: Date;
}
