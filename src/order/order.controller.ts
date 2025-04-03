// src/order/order.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
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
  ApiParam,
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
      userId: user?.id ?? null,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista todos os pedidos (somente ADMIN)' })
  async findAll(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return this.orderService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista os pedidos do usuário autenticado' })
  async findMyOrders(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return await this.orderService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-store')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista os pedidos da loja do admin autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos da loja' })
  async findOrdersByStore(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return await this.orderService.findByStore(user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualiza um pedido' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrderDto })
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove um pedido (usuário ou admin)' })
  @ApiParam({ name: 'id', type: Number })
  async removeOrder(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<void> {
    const user = req.user as any;
    await this.orderService.removeOrder(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um pedido pelo ID (público)' })
  @ApiParam({ name: 'id', type: Number })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
@Get('my-store/customers')
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Ranking de clientes da loja do admin autenticado' })
@ApiResponse({
  status: 200,
  description: 'Lista de clientes com total de pedidos e valor gasto',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        phone: { type: 'string' },
        orders: { type: 'number' },
        totalSpent: { type: 'string' },
      },
    },
  },
})
async getCustomerRanking(@Req() req: Request) {
  const user = req.user as any;
  return this.orderService.getCustomerRankingByStore(user.store?.id);
}

}
