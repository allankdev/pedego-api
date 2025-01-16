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

  // Método para registrar um novo usuário
  async register(username: string, plainPassword: string): Promise<any> {
    // Verifica se o usuário já existe
    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new UnauthorizedException('Usuário já existe!');
    }

    // Cria o novo usuário com a senha criptografada
    const newUser = await this.userService.create(username, plainPassword);

    // Cria o payload para o JWT
    const payload = { username: newUser.username, sub: newUser.id, role: newUser.role };

    // Retorna o token JWT
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Método para login
  async login(user: any) {
    // Cria o payload para o JWT
    const payload = { username: user.username, sub: user.id, role: user.role };
    // Retorna o token JWT
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
