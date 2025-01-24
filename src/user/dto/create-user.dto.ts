// src/user/dto/create-user.dto.ts
export class CreateUserDto {
    name: string;
    email: string;
    username: string;
    password: string;
    role?: string;
  }
  
  // src/user/dto/update-user.dto.ts
  export class UpdateUserDto {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: string;
  }
  
  // src/order/dto/create-order.dto.ts
  export class CreateOrderDto {
    product: string;
    price: number;
    userId: number;
  }
  
  // src/order/dto/update-order.dto.ts
  export class UpdateOrderDto {
    product?: string;
    price?: number;
  }
  