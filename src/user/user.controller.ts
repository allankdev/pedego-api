import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';  // DTO para atualização de usuário

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Método para buscar usuário por ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    try {
      return await this.userService.findOne(id); // Chamando o serviço de findOne
    } catch (error) {
      throw error;  // Lançando a exceção do serviço
    }
  }

  // Método para listar todos os usuários
  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.userService.findAll(); // Chamando o serviço de findAll
    } catch (error) {
      throw error; // Lançando a exceção do serviço
    }
  }

  // Método para criar um novo usuário
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto  // Passando o DTO completo
  ): Promise<User> {
    try {
      return await this.userService.create(createUserDto); // Chamando o serviço para criar o usuário
    } catch (error) {
      throw error; // Lançando a exceção do serviço
    }
  }

  // Método para editar um usuário existente
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto  // Usando o DTO para atualizar
  ): Promise<User> {
    try {
      return await this.userService.update(id, updateUserDto); // Chamando o serviço para atualizar o usuário
    } catch (error) {
      throw error; // Lançando a exceção do serviço
    }
  }

  // Método para deletar um usuário
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    try {
      return await this.userService.remove(id); // Chamando o serviço para deletar o usuário
    } catch (error) {
      throw error; // Lançando a exceção do serviço
    }
  }
}
