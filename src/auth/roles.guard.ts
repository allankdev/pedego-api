import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtém as roles exigidas para a rota
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Se não houver roles exigidas, permite o acesso
    }

    const { user } = context.switchToHttp().getRequest();  // Obter o usuário do request

    console.log('RolesGuard User:', user);  // Verifique o conteúdo de req.user aqui

    // Verifica se o usuário tem a role exigida
    if (!user || !requiredRoles.some(role => user.role && user.role.includes(role))) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
