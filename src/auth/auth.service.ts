// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Validação do usuário
  async validateUser(username: string, plainPassword: string): Promise<any> {  // Renomeei o parâmetro 'password' para 'plainPassword'
    const user = await this.userService.findByUsername(username); // Recuperando o usuário

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado!'); // Caso o usuário não exista
    }

    // Comparando a senha de forma assíncrona
    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha invalida'); // Caso a senha não seja válida
    }

    const { password, ...result } = user; // Removendo a senha do objeto de resposta
    return result;
  }

  // Método de login que retorna o token JWT
  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role }; // Gerando o payload para o JWT
    return {
      access_token: this.jwtService.sign(payload), // Gerando o token com o payload
    };
  }
}
