import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2'; // Usando argon2 para hashing
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Função de registro
  async register(name: string, email: string, password: string) {
    console.log('[AuthService] Registro iniciado...');

    const hashedPassword = await argon2.hash(password);
    console.log('[AuthService] Senha Hashada:', hashedPassword);

    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword, // Armazenando a senha corretamente
      role: 'CUSTOMER',
    });

    // Buscar o usuário logo após salvar e verificar se o hash está igual
    const savedUser = await this.userService.findByEmail(email);
    console.log('[AuthService] Senha armazenada no banco após salvar:', savedUser.password);

    if (hashedPassword !== savedUser.password) {
      console.log('[ERRO] O hash mudou ao salvar no banco!');
      throw new ConflictException('Erro ao salvar a senha no banco de dados');
    }

    return {
      message: 'Usuário registrado com sucesso',
      user,
    };
  }

  // Função de login
  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id }; // O 'sub' vai armazenar o ID do usuário
    const accessToken = this.jwtService.sign(payload); // Gera o JWT

    return { access_token: accessToken };
  }

  // Validação de usuário por ID (usado no JWT Strategy)
  async validateUserById(id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }
}
