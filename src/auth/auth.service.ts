import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Response } from 'express'
import { UserService } from '../user/user.service'
import { User } from '../user/user.entity'
import { StoreService } from '../store/store.service'
import { SubscriptionService } from '../subscription/subscription.service'
import { RegisterStoreDto } from './dtos/register-store.dto'
import { UserRole } from '../user/enums/user-role.enum'


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly storeService: StoreService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async registerAsStore(dto: RegisterStoreDto, res: Response) {
    const existingUser = await this.userService.findByEmail(dto.email)
    if (existingUser) {
      throw new ConflictException('E-mail já está em uso')
    }

    const hashedPassword = await argon2.hash(dto.password)

    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    })

    const store = await this.storeService.create({
      name: dto.storeName,
      description: dto.description,
      subdomain: dto.subdomain,
    })

    user.store = store
    await this.userService.save(user)

    await this.subscriptionService.createTrial(user.id)

    const payload = {
      sub: user.id,
      role: user.role,
      storeId: store.id,
    }

    const accessToken = this.jwtService.sign(payload)

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // ESSENCIAL: garante que o clearCookie funcione
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    })

    return {
      message: 'Loja criada com 30 dias de teste grátis!',
      user,
      store,
    }
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.userService.findByEmailWithStore(email)

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const isPasswordValid = await argon2.verify(user.password, password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const payload = {
      sub: user.id,
      role: user.role,
      storeId: user.store?.id,
    }

    const accessToken = this.jwtService.sign(payload)

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // ESSENCIAL: garante que o clearCookie funcione
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    return {
      message: 'Login efetuado com sucesso',
      user,
      access_token: accessToken,
    }
  }

  async validateUserById(id: number): Promise<User> {
    const user = await this.userService.findByIdWithStore(id)
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado')
    }
    return user
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    res: Response,
  ) {
    const user = await this.userService.findById(userId)
  
    if (!user || !user.password) {
      throw new UnauthorizedException('Usuário inválido')
    }
  
    const isPasswordValid = await argon2.verify(user.password, currentPassword)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta')
    }
  
    const newHashedPassword = await argon2.hash(newPassword)
    user.password = newHashedPassword
  
    await this.userService.save(user)
  
    // ⚠️ Invalida o token atual
    res.clearCookie('token', {
      path: '/', // importante garantir que seja o mesmo path usado no .cookie()
    })
  
    return { message: 'Senha alterada com sucesso, você foi deslogado' }
  }
  
  
}
