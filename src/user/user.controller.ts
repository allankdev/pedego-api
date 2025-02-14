import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto'; // Seu DTO de criação de usuário
import { UpdateUserDto } from './dto/update-user.dto'; // Seu DTO de atualização de usuário

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id); // Corrigido para chamar o método correto
  }

  @Get()
  async findAll() {
    return this.userService.findAll(); // Corrigido para chamar o método correto
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
