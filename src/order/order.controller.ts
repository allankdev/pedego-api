import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
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
      userId: user?.id ?? null, // se estiver logado, usa user.id
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista todos os pedidos (somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  async findAll(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return this.orderService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista os pedidos do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos do usuário' })
  async findMyOrders(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any;
    return await this.orderService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualiza um pedido' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do pedido' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao atualizar pedido' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Request
  ): Promise<Order> {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove um pedido (usuário ou admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao deletar pedido' })
  async removeOrder(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<void> {
    const user = req.user as any;
    await this.orderService.removeOrder(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um pedido pelo ID (público)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido retornado com sucesso', type: Order })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }
}
