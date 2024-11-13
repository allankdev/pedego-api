// src/order/dto/create-order.dto.ts
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;  // ID do usuário que está criando o pedido
}
