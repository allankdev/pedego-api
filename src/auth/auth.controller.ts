import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterStoreDto } from './dtos/register-store.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado com a loja (se ADMIN)' })
  @ApiBearerAuth()
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    
    // Retorna o usuário com as informações da loja, se presente
    try {
      const validatedUser = await this.authService.validateUserById(user.sub);
      if (validatedUser.store) {
        return {
          user: validatedUser,
          store: validatedUser.store,  // Incluir as informações da loja
        };
      }
      return validatedUser;  // Se não houver loja associada ao usuário, retorna só os dados do usuário
    } catch (error) {
      throw new BadRequestException('Erro ao obter perfil do usuário');
    }
  }
}
