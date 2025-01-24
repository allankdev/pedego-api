import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rota para registro de usuário
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { email, username, password, name } = registerDto;
    return this.authService.register(email, username, password, name);
  }

  // Rota para realizar login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }
}
