import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterStoreDto } from './dtos/register-store.dto';
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

  @Post('register-as-store')
  @ApiOperation({ summary: 'Registro de loja com 30 dias grátis (ADMIN)' })
  @ApiBody({ type: RegisterStoreDto })
  @ApiResponse({ status: 201, description: 'Loja registrada e trial iniciado' })
  @ApiResponse({ status: 400, description: 'Erro ao registrar loja' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async registerAsStore(@Body() registerStoreDto: RegisterStoreDto) {
    try {
      return await this.authService.registerAsStore(registerStoreDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário (CUSTOMER, ADMIN ou SUPER_ADMIN)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Credenciais inválidas' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
