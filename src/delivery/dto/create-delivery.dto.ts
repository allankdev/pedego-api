// src/delivery/dto/create-delivery.dto.ts
import { IsString, IsInt, IsOptional } from 'class-validator'; // Para validação de dados

export class CreateDeliveryDto {
  @IsString()
  @IsOptional() // Opcional, caso não seja necessário em todos os casos
  address: string;

  @IsInt()
  orderId: number; // ID do pedido associado à entrega

  @IsString()
  status: string; // Status da entrega, ex: "Em andamento", "Entregue"
}
