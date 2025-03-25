import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { StoreService } from '../store/store.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { RegisterStoreDto } from './dtos/register-store.dto';
import { UserRole } from '../user/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly storeService: StoreService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // Registro normal de usuário (CUSTOMER)
  async register(name: string, email: string, password: string) {
    const hashedPassword = await argon2.hash(password);

    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.userService.findByEmail(email);

    if (hashedPassword !== savedUser.password) {
      throw new ConflictException('Erro ao salvar a senha no banco de dados');
    }

    return {
      message: 'Usuário registrado com sucesso',
      user,
    };
  }

  // Registro como loja (recebe role ADMIN + trial de 30 dias)
  async registerAsStore(dto: RegisterStoreDto) {
    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const store = await this.storeService.create({
      name: dto.storeName,
      description: dto.description,
      subdomain: dto.subdomain,
    });

    await this.subscriptionService.createTrial(user.id); // 30 dias grátis

    return {
      message: 'Loja criada com 30 dias de teste grátis!',
      user,
      store,
    };
  }

  // Login do usuário
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      message: 'Login efetuado com sucesso',
      user,
      access_token,
    };
  }

  // Validação do usuário via token
  async validateUserById(id: number): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}
