import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Allan Kelven',
    description: 'Nome completo do usuário',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  name: string;

  @ApiProperty({
    example: 'allan@email.com',
    description: 'E-mail válido do usuário',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    example: 'minhaSenha123',
    description: 'Senha com pelo menos 6 caracteres',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
