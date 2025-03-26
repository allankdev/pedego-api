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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
@ApiOperation({ summary: 'Cria um novo pedido (autenticado ou anônimo)' })
@ApiBody({ type: CreateOrderDto })
@ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
async createOrder(@Body() orderData: CreateOrderDto, @Req() req: Request): Promise<Order> {
  const user = req.user as any;

  return await this.orderService.createOrder({
    ...orderData,
    userId: user?.id ?? null, // pode ser undefined/null
  });
}


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todos os pedidos (somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  @Roles('CUSTOMER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista os pedidos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do usuário' })
  async findMyOrders(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return await this.orderService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles('CUSTOMER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um pedido' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao atualizar pedido' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('CUSTOMER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove um pedido (usuário ou admin)' })
  @ApiResponse({ status: 200, description: 'Pedido removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao deletar pedido' })
  async removeOrder(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<void> {
    const user = req.user as any;
    await this.orderService.removeOrder(id, user);
  }
}