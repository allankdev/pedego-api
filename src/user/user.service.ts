import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';  // Substituímos bcrypt por argon2

// Novo tipo para representar o usuário sem a senha
export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Método para criar um novo usuário
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, role } = createUserDto;

    // Verifica se já existe um usuário com o e-mail fornecido
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com esse e-mail');
    }

    // Criptografa a senha do usuário usando argon2
    const hashedPassword = await argon2.hash(password);

    // Cria o novo usuário
    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'CUSTOMER', // Define o papel como 'CUSTOMER' por padrão
    });

    try {
      // Salva o novo usuário no banco de dados
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar o usuário');
    }
  }

  // Método para buscar todos os usuários (com paginação)
  async findAll(page: number = 1, limit: number = 10): Promise<UserWithoutPassword[]> {
    const skip = (page - 1) * limit;
    const users = await this.userRepository.find({
      relations: ['orders'],
      skip,
      take: limit,
    });

    // Remove a senha de cada usuário antes de retornar
    return users.map((user) => this.removeSensitiveData(user));
  }

  // Método para buscar um usuário por ID
  async findOne(id: number): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.removeSensitiveData(user);
  }

  // Método para buscar um usuário pelo e-mail
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'], // Inclui a senha para autenticação
    });
  }

  // Método para atualizar um usuário existente
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Atualiza apenas os campos fornecidos no DTO
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.role) user.role = updateUserDto.role;

    // Se a senha for fornecida, criptografa e atualiza
    if (updateUserDto.password) {
      user.password = await argon2.hash(updateUserDto.password);  // Usando argon2 aqui
    }

    try {
      const updatedUser = await this.userRepository.save(user);
      return this.removeSensitiveData(updatedUser);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar o usuário');
    }
  }

  // Método para remover um usuário
  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    try {
      await this.userRepository.remove(user);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao remover o usuário');
    }
  }

  // Método para remover dados sensíveis do usuário antes de retornar
  private removeSensitiveData(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
