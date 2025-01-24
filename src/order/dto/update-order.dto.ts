// src/order/dto/update-order.dto.ts
import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsOptional() // Pode ser atualizado se fornecido
  description?: string;

  @IsInt()
  @IsOptional() // Pode ser atualizado se fornecido
  userId?: number;

  @IsUUID()
  @IsOptional() // Pode ser atualizado se fornecido
  deliveryId?: string;
}
