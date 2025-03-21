import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum'; // ✅ Corrigido

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Registro de usuário
  async register(name: string, email: string, password: string) {
    console.log('[AuthService] Registro iniciado...');

    const hashedPassword = await argon2.hash(password);
    console.log('[AuthService] Senha hash gerada:', hashedPassword);

    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER, // ✅ Corrigido para usar o enum
    });

    const savedUser = await this.userService.findByEmail(email);

    if (hashedPassword !== savedUser.password) {
      console.log('[ERRO] O hash mudou ao salvar no banco!');
      throw new ConflictException('Erro ao salvar a senha no banco de dados');
    }

    return {
      message: 'Usuário registrado com sucesso',
      user,
    };
  }

  // Login de usuário
  async login(email: string, password: string) {
    console.log(`[LOGIN] Tentativa de login com o e-mail: ${email}`);

    const user = await this.userService.findByEmail(email);

    if (!user) {
      console.warn(`[LOGIN] Usuário não encontrado: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      console.warn(`[LOGIN] Senha inválida para o e-mail: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log(`[LOGIN] Autenticado com sucesso: ${user.email}`);

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

  async validateUserById(id: number): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}
