// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Cria ou retorna usuário existente com base no telefone (para clientes)
  async create(userData: Partial<User>): Promise<User> {
    if (userData.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: userData.phone },
      });
      if (existingUser) return existingUser;
    }

    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  // Buscar usuário por ID
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  // Buscar usuário por telefone (apenas usuário simples, usado internamente)
  async findByPhone(phone: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException(`Usuário com telefone ${phone} não encontrado`);
    }
    return user;
  }

  // 🔥 Buscar usuário por telefone + último bairro
  async findByPhoneWithLastNeighborhood(phone: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { phone },
      relations: ['orders', 'orders.neighborhood'],
      order: { id: 'DESC' }, // pega o mais novo pelo ID se quiser mais segurança
    });

    if (!user) {
      throw new NotFoundException(`Usuário com telefone ${phone} não encontrado`);
    }

    // Pega o último pedido do usuário (se houver)
    const lastOrder = user.orders?.[0];

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      address: user.address,
      lastNeighborhood: lastOrder?.neighborhood
        ? {
            id: lastOrder.neighborhood.id,
            name: lastOrder.neighborhood.name,
            deliveryFee: lastOrder.neighborhood.deliveryFee,
          }
        : null,
    };
  }

  // Buscar todos os usuários
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Atualizar usuário
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  // Remover usuário
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  // Buscar usuário por e-mail (usado em login de loja)
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByIdWithStore(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmailWithStore(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['store'],
    });
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
