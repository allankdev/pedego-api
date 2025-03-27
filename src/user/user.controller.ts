import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { UserRole } from './enums/user-role.enum';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário (registro automático pelo telefone)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: User })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [User] })
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    // Certifique-se de que o `req.user` contém a role e id corretamente
    console.log(user);  // Adicione um log para verificar o conteúdo de `req.user`
  
    return this.userService.findAll();
  }
  
  @Get('phone/:phone')
  @ApiOperation({ summary: 'Busca um usuário pelo telefone (público)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  async findByPhone(@Param('phone') phone: string) {
    return this.userService.findByPhone(phone);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.id !== id) {
      throw new ForbiddenException('Acesso negado');
    }
    return this.userService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Atualiza um usuário' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const user = req.user as any;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.id !== id) {
      throw new ForbiddenException('Acesso negado');
    }
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove um usuário' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.remove(id);
  }
}
