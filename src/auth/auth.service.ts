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
    // Log: Tentativa de login com e-mail
    console.log(`[LOGIN] Tentando fazer login com o e-mail: ${email}`);
  
    const user = await this.userService.findByEmail(email);
  
    // Log: Verificando se o usuário existe
    if (!user) {
      console.warn(`[LOGIN] Usuário não encontrado com o e-mail: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }
  
    // Log: Verificando a senha
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      console.warn(`[LOGIN] Senha inválida fornecida para o e-mail: ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }
  
    // Log: Senha validada com sucesso
    console.log(`[LOGIN] Senha validada com sucesso para o e-mail: ${email}`);
  
    const payload = { sub: user.id }; // O 'sub' vai armazenar o ID do usuário
    const accessToken = this.jwtService.sign(payload); // Gera o JWT
  
    // Log: Token gerado com sucesso
    console.log(`[LOGIN] Token JWT gerado com sucesso para o usuário ID: ${user.id}`);
  
    // Retorna a resposta com sucesso
    return {
      message: 'Login efetuado com sucesso',
      user,  // Retorna o usuário autenticado
      access_token: accessToken, // Retorna o token gerado
    };
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
