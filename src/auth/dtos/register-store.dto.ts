import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterStoreDto {
  @ApiProperty({
    example: 'Allan Kelven',
    description: 'Nome completo do responsável pela loja',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  name: string;

  @ApiProperty({
    example: 'loja@email.com',
    description: 'E-mail de cadastro da loja',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    example: 'senhaSegura123',
    description: 'Senha com no mínimo 6 caracteres',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Loja do Allan',
    description: 'Nome da loja que será exibido para os clientes',
  })
  @IsString({ message: 'O nome da loja deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da loja não pode estar vazio' })
  storeName: string;

  @ApiProperty({
    example: 'Loja especializada em lanches e bebidas',
    description: 'Breve descrição da loja',
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição não pode estar vazia' })
  description: string;

  @ApiProperty({
    example: 'loja-do-allan',
    description: 'Subdomínio exclusivo da loja (usado na URL)',
  })
  @IsString({ message: 'O subdomínio deve ser uma string' })
  @IsNotEmpty({ message: 'O subdomínio não pode estar vazio' })
  subdomain: string;
}
