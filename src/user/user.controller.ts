import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Defina o tipo UserWithoutPassword
export type UserWithoutPassword = Omit<User, 'password'>;

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Método para buscar usuário por ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserWithoutPassword> {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  // Método para listar todos os usuários
  @Get()
  async findAll(): Promise<UserWithoutPassword[]> {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw error;
    }
  }

  // Método para criar um novo usuário
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<User> {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      throw error;
    }
  }

  // Método para editar um usuário existente
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserWithoutPassword> {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      throw error;
    }
  }

  // Método para deletar um usuário
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    try {
      return await this.userService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}