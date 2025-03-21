import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifica se a rota ou controlador tem o decorator @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Permite acesso sem autenticação se for pública
    }

    try {
      // Caso contrário, chama a implementação padrão do AuthGuard('jwt')
      const result = await super.canActivate(context);
      return result instanceof Promise ? result : Promise.resolve(result);
    } catch (error) {
      throw new UnauthorizedException('Usuário não autenticado ou sessão expirada');
    }
  }
}
