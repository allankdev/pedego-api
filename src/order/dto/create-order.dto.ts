// src/order/dto/create-order.dto.ts
import { IsString, IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsOptional() // Pode ser opcional, mas se fornecido deve ser um UUID válido
  @IsUUID()
  deliveryId?: string;
}
