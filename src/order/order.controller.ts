import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido (CUSTOMER ou ADMIN)' })
  @ApiBody({ type: CreateOrderDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOrder(
    @Body() orderData: CreateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    try {
      const user = req.user as any;
      return await this.orderService.createOrder({
        ...orderData,
        userId: user.id,
      });
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

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos (somente ADMIN)' })
  async findAll(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    if (user.role !== 'ADMIN') {
      throw new HttpException('Acesso negado', HttpStatus.FORBIDDEN);
    }
    return this.orderService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Lista os pedidos do usuário autenticado' })
  async findMyOrders(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return await this.orderService.findByUserId(user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um pedido' })
  @ApiBody({ type: UpdateOrderDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    try {
      return await this.orderService.updateOrder(id, updateOrderDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao atualizar pedido',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um pedido (usuário ou admin)' })
  async removeOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const user = req.user as any;
      await this.orderService.removeOrder(id, user);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao deletar pedido',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}