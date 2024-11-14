import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Método para buscar usuário por ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    try {
      return await this.userService.findOne(id); // Chamando o serviço de findOne
    } catch (error) {
      throw error;  // Lançando a exceção do serviço, que já está em português
    }
  }
}
