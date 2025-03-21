import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2'; // Usando argon2 para hashing
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Função de registro - Usando somente argon2
  async register(name: string, email: string, password: string) {
    console.log('[AuthService] Registro iniciado...');
    console.log(`[AuthService] Parâmetros recebidos: nome = ${name}, e-mail = ${email}`);

    // Verifica se o e-mail já está em uso
    console.log('[AuthService] Verificando se o e-mail já está em uso...');
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      console.log('[AuthService] E-mail já está em uso:', email);
      throw new ConflictException('Este e-mail já está em uso');
    }
    console.log('[AuthService] E-mail disponível.');

    // Gerar o hash da senha usando argon2 com parâmetros seguros
    console.log('[AuthService] Gerando hash para a senha...');
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,   // argon2id é mais seguro para uso geral
      memoryCost: 65536,        // 64MB de memória
      timeCost: 3,              // 3 iterações
      parallelism: 4,           // 4 threads
    });
    console.log('[AuthService] Senha hashada com argon2:', hashedPassword); // Logando o hash gerado (em produção, não logue!)

    // Criação do usuário no banco de dados
    console.log('[AuthService] Criando usuário no banco de dados...');
    const user = await this.userService.create({
      name,
      email,
      password,
      role: 'CUSTOMER', // ou o papel adequado para o seu sistema
    });
    console.log('[AuthService] Usuário criado com sucesso no banco de dados. ID:', user.id);

    // Remover a senha do objeto do usuário antes de retornar
    const { password: _, ...userWithoutPassword } = user;
    console.log('[AuthService] Removendo a senha do objeto do usuário.');

    console.log('[AuthService] Registro concluído com sucesso.');
    return {
      message: 'Usuário registrado com sucesso',
      user: userWithoutPassword,
    };
  }

  // Função de login - Verificação com argon2
  async login(email: string, password: string) {
    console.log('[AuthService] Login iniciado...');
    console.log(`[AuthService] Parâmetros recebidos: e-mail = ${email}`);

    // Buscar o usuário pelo e-mail
    console.log('[AuthService] Buscando usuário pelo e-mail...');
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log('[AuthService] Usuário não encontrado:', email);
      throw new UnauthorizedException('Usuário não encontrado');
    }
    console.log('[AuthService] Usuário encontrado:', user.id);

    // Verificar a senha usando argon2
    console.log('[AuthService] Verificando a senha...');
    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
      console.log('[AuthService] Senha incorreta para o usuário:', email);
      throw new UnauthorizedException('Senha incorreta');
    }
    console.log('[AuthService] Senha verificada com sucesso.');

    // Gerar o token JWT
    console.log('[AuthService] Gerando o token JWT...');
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    console.log('[AuthService] Token JWT gerado com sucesso.');

    // Remover a senha do objeto do usuário antes de retornar
    const { password: _, ...userWithoutPassword } = user;
    console.log('[AuthService] Removendo a senha do objeto do usuário para a resposta.');

    console.log('[AuthService] Login concluído com sucesso.');
    return {
      message: 'Login bem-sucedido',
      accessToken,
      user: userWithoutPassword,
    };
  }
}



