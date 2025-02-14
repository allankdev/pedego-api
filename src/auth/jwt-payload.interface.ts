// src/auth/jwt-payload.interface.ts
export interface JwtPayload {
    sub: string; // O ID do usuário (ou qualquer outro dado que você queira incluir)
    email: string; // E-mail do usuário (por exemplo)
  }
  