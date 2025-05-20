// src/subscription/dto/upgrade-subscription-request.dto.ts
import { IsIn, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeSubscriptionRequestDto {
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
