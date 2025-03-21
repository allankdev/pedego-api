import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'ID do usuário que receberá a notificação' })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 'Pedido entregue com sucesso!', description: 'Mensagem da notificação' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'success', description: 'Tipo da notificação (ex: success, error, info)' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
