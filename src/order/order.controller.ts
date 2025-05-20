import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common'
import { Request } from 'express'
import { OrderService } from './order.service'
import { Order } from './order.entity'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pedido (autenticado ou anônimo)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso', type: Order })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOrder(@Body() orderData: CreateOrderDto, @Req() req: Request): Promise<Order> {
    const user = req.user as any
    return await this.orderService.createOrder({
      ...orderData,
      userId: user?.id ?? null,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista todos os pedidos (somente ADMIN)' })
  @ApiResponse({ status: 200, type: [Order] })
  async findAll(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any
    return this.orderService.findAll(user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista os pedidos do usuário autenticado' })
  @ApiResponse({ status: 200, type: [Order] })
  async findMyOrders(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any
    return await this.orderService.findByUserId(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-store')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista os pedidos da loja do admin autenticado' })
  @ApiResponse({ status: 200, type: [Order] })
  async findOrdersByStore(@Req() req: Request): Promise<Order[]> {
    const user = req.user as any
    return await this.orderService.findByStore(user)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualiza um pedido' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, type: Order })
  async updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    return await this.orderService.updateOrder(id, updateOrderDto)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancela um pedido (usuário ou admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Order })
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Order> {
    const user = req.user as any
    return await this.orderService.cancelOrder(id, user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um pedido pelo ID (público)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Order })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id)
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
    const user = req.user as any
    return this.orderService.getCustomerRankingByStore(user.store?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-store/stats')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Resumo das vendas da loja do admin autenticado' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (yyyy-mm-dd)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (yyyy-mm-dd)' })
  async getSalesStats(
    @Req() req: Request,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as any
    return this.orderService.getSalesStats(user.store?.id, startDate, endDate)
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-store/top-products')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Produtos mais vendidos da loja do admin autenticado' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de produtos retornados', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista dos produtos mais vendidos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'number' },
          productName: { type: 'string' },
          totalSold: { type: 'number' },
        },
      },
    },
  })
  async getTopProducts(@Req() req: Request, @Query('limit') limit?: string) {
    const user = req.user as any
    return this.orderService.getTopProductsByStore(user.store?.id, Number(limit) || 5)
  }

  @UseGuards(JwtAuthGuard)
@Get('my-store/daily-sales')
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Vendas diárias da loja do admin autenticado' })
@ApiQuery({ name: 'startDate', required: false })
@ApiQuery({ name: 'endDate', required: false })
@ApiResponse({
  status: 200,
  description: 'Retorna vendas diárias (data, pedidos e total)',
  schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date' },
        orders: { type: 'number' },
        total: { type: 'number' },
      },
    },
  },
})
async getDailySales(
  @Req() req: Request,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  const user = req.user as any;
  return this.orderService.getDailySalesByStore(user.store?.id, startDate, endDate);
}


  
}
