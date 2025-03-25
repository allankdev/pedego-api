// src/subscription/dto/upgrade-subscription.dto.ts
import { IsIn, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeSubscriptionDto {
  @ApiProperty({ example: 1, description: 'ID do usuário' })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 'MONTHLY',
    enum: ['MONTHLY', 'YEARLY'],
    description: 'Plano desejado',
  })
  @IsIn(['MONTHLY', 'YEARLY'])
  plan: 'MONTHLY' | 'YEARLY';
}
