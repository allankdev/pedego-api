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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const result = await super.canActivate(context);
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      // ✅ Permite acesso se for SUPER_ADMIN mesmo sem store
      if (user.role !== 'SUPER_ADMIN' && !user?.store) {
        throw new UnauthorizedException('Loja não associada ao usuário');
      }

      console.log('USER (JwtAuthGuard):', user);

      return !!result;
    } catch (error) {
      console.error('Erro de autenticação:', error);
      throw new UnauthorizedException('Usuário não autenticado ou sessão expirada');
    }
  }
}
