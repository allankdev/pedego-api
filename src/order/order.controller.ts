// src/order/order.controller.ts
import { Controller, Post, Body, Get, UseGuards, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas as rotas com JWT e Role Guards
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Rota para criar um pedido
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Validação do DTO
  async createOrder(@Body() orderData: CreateOrderDto): Promise<Order> {
    try {
      return await this.orderService.createOrder(orderData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao criar pedido',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Rota para listar todos os pedidos (apenas para administradores)
  @Get()
  @Roles('ADMIN') // Apenas administradores podem acessar esta rota
  async findAll(): Promise<Order[]> {
    try {
      return await this.orderService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Erro ao buscar pedido',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
