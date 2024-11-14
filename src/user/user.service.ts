import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';  // Certifique-se de que a entidade User está corretamente definida

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Método findByUsername com exceção personalizada em português
  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`Usuário com o nome de usuário ${username} não encontrado`);  // Exceção em português
    }
    return user;
  }

  // Método findOne com exceção personalizada em português
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado`);  // Exceção em português
    }
    return user;
  }
}
