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

  // Registro como loja (recebe role ADMIN + trial de 30 dias)
  async registerAsStore(dto: RegisterStoreDto) {
    // 🔐 Verifica se o e-mail já está em uso, considerando apenas lojas (admin)
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já está em uso');
    }

    // Cria o usuário com senha criptografada
    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    // Cria a loja vinculada ao admin
    const store = await this.storeService.create({
      name: dto.storeName,
      description: dto.description,
      subdomain: dto.subdomain,
    });

    // Cria assinatura trial de 30 dias
    await this.subscriptionService.createTrial(user.id);

    return {
      message: 'Loja criada com 30 dias de teste grátis!',
      user,
      store,
    };
  }

  // Login do usuário ADMIN
  async login(email: string, password: string) {
    // Busca o usuário pelo email
    const user = await this.userService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica se a senha está correta
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera o payload para o JWT
    const payload = {
      sub: user.id,
      role: user.role,
    };

    // Gera o token de autenticação
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
