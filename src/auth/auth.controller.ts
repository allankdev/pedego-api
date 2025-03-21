import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao registrar usuário',
  })
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(
        registerDto.name,
        registerDto.email,
        registerDto.password,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Credenciais inválidas',
  })
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
