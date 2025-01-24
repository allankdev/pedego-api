import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Método para criar um novo usuário
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, name, role } = createUserDto;

    // Verifica se já existe um usuário com o e-mail ou nome de usuário fornecido
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário com esse email ou nome de usuário');
    }

    // Criptografa a senha do usuário
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      name,
      role: role || 'CUSTOMER', // Define o papel como 'CUSTOMER' por padrão
    });

    // Salva o novo usuário no banco de dados
    return await this.userRepository.save(newUser);
  }

  // Método para buscar todos os usuários
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['orders'] });
  }

  // Método para buscar um usuário por ID
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // Método para buscar um usuário pelo e-mail
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Método para atualizar um usuário existente
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Atualiza o usuário com os dados fornecidos no DTO
    Object.assign(user, updateUserDto);

    // Se a senha for fornecida no DTO, ela é criptografada e atualizada
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Salva o usuário atualizado no banco de dados
    return await this.userRepository.save(user);
  }

  // Método para remover um usuário
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
