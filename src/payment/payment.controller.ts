import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ✅ ROTA PÚBLICA
  @Post()
  @ApiOperation({ summary: 'Cria um novo pagamento (público)' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Pagamento criado com sucesso',
    type: Payment,
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  // 🔒 ROTAS PROTEGIDAS COM JWT + ROLE

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista todos os pagamentos (somente ADMIN)' })
  @ApiResponse({ status: 200, type: [Payment] })
  async getPayments(): Promise<Payment[]> {
    return this.paymentService.getPayments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-store')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista os pagamentos da minha loja (somente ADMIN)' })
  @ApiResponse({ status: 200, type: [Payment] })
  async getPaymentsByStore(@Req() req: Request): Promise<Payment[]> {
    const user = req.user as any;
    if (!user?.store?.id) {
      throw new ForbiddenException('Loja não encontrada no token do usuário');
    }
    return this.paymentService.getPaymentsByStore(user.store.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Busca um pagamento por ID (ADMIN ou dono do pedido)' })
  @ApiResponse({ status: 200, type: Payment })
  async getPaymentById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Payment> {
    const user = req.user as any;
    const payment = await this.paymentService.getPaymentById(id);

    if (user.role !== 'ADMIN' && payment.order?.user?.id !== user.id) {
      throw new ForbiddenException('Você não tem permissão para acessar esse pagamento');
    }

    return payment;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualiza os dados de um pagamento (somente ADMIN)' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, type: Payment })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.updatePayment(id, updatePaymentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/cancel')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancela um pagamento (somente ADMIN)' })
  @ApiResponse({ status: 200, type: Payment })
  async cancelPayment(@Param('id', ParseIntPipe) id: number): Promise<Payment> {
    return this.paymentService.cancelPayment(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove um pagamento (somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Pagamento removido com sucesso' })
  async deletePayment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentService.deletePayment(id);
  }
}
