// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Rota para registrar um novo usuário
  @Post('register')
  async register(@Body() body) {
    const { username, password } = body; // Extraindo os campos 'username' e 'password' do corpo da requisição
    return this.authService.register(username, password); // Chamando o serviço para registrar o usuário
  }

  // Rota para realizar login
  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body); // Chamando o serviço para fazer o login
  }
}
