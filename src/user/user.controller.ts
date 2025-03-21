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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from './user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: User })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: User })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [User] })
  async findAll() {
    return this.userService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso', type: User })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.remove(id);
  }
}
