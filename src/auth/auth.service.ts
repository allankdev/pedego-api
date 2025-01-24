import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';  // Importando bcrypt

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  // Método para registrar o usuário
  async register(email: string, username: string, password: string, name: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso');
    }

    // Usando bcrypt para gerar o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);  // O 10 é o número de rounds

    // Log para conferir o hash gerado
    console.log('Hash gerado:', hashedPassword);

    const user = await this.userService.create({
      email,
      username,
      password,
      name,
      role: 'CUSTOMER',
    });

    return { message: 'Usuário registrado com sucesso', user };
  }

  // Método de login
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Log para conferir a senha fornecida e o hash armazenado
    console.log('Senha fornecida:', password);
    console.log('Hash armazenado:', user.password);

    // Verifica a senha fornecida com o hash armazenado usando bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Senha match:', passwordMatch);  // Verifique se a comparação deu true ou false

    if (!passwordMatch) {
      throw new UnauthorizedException('Senha incorreta');
    }

    return { message: 'Login bem-sucedido', user };
  }
}
