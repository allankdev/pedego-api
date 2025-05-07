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
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dtos/login.dto'
import { RegisterStoreDto } from './dtos/register-store.dto'
import { ChangePasswordDto } from './dtos/change-password.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Request, Response } from 'express'

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
  async registerAsStore(
    @Body() registerStoreDto: RegisterStoreDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.registerAsStore(registerStoreDto, res)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário (CUSTOMER, ADMIN ou SUPER_ADMIN)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Credenciais inválidas' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.authService.login(loginDto.email, loginDto.password, res)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout do usuário (limpa o cookie)' })
  @ApiResponse({ status: 200, description: 'Logout efetuado com sucesso' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return { message: 'Logout efetuado com sucesso' }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Retorna o usuário autenticado com a loja (se ADMIN)' })
  @ApiBearerAuth()
  async getProfile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as any

    try {
      const validatedUser = await this.authService.validateUserById(user.sub)

      if (!validatedUser) {
        res.clearCookie('token')
        throw new UnauthorizedException('Usuário inválido')
      }

      return validatedUser.store
        ? { user: validatedUser, store: validatedUser.store }
        : { user: validatedUser }
    } catch (error) {
      res.clearCookie('token')
      throw new UnauthorizedException('Token inválido ou expirado')
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Altera a senha do usuário autenticado e faz logout' })
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as any
    const result = await this.authService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
      res,
    )
  
    return result
  }
}