import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'E-mail do usuário para login',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    example: 'minhaSenhaSegura123',
    description: 'Senha do usuário',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  password: string;
}
