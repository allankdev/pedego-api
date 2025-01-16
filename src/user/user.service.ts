// src/user/user.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity'; // Certifique-se de que a entidade User está corretamente definida
import * as bcrypt from 'bcrypt';

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
      throw new NotFoundException(`Usuário com o nome de usuário ${username} não encontrado`); // Exceção em português
    }
    return user;
  }

  // Método findOne com exceção personalizada em português
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado`); // Exceção em português
    }
    return user;
  }

  // Método para criar um novo usuário
  async create(username: string, plainPassword: string): Promise<User> {
    // Verificando se o usuário já existe
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com esse nome de usuário');
    }

    // Criptografando a senha
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Criando um novo usuário
    const newUser = this.userRepository.create({
      username,
      password: hashedPassword, // Armazenando a senha criptografada
    });

    return await this.userRepository.save(newUser); // Salvando o novo usuário no banco
  }
}
