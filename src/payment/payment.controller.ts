import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  Req,
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
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Cria um novo pagamento (apenas CUSTOMER)' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso', type: Payment })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
  ): Promise<Payment> {
    const user = req.user as any;
    // Se quiser garantir que o pedido é dele, precisaria buscar o pedido e verificar o dono.
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista todos os pagamentos (somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada com sucesso', type: [Payment] })
  async getPayments(): Promise<Payment[]> {
    return this.paymentService.getPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pagamento por ID (ADMIN ou dono do pedido)' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado com sucesso', type: Payment })
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

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualiza os dados de um pagamento existente (somente ADMIN)' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Pagamento atualizado com sucesso', type: Payment })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.updatePayment(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove um pagamento (somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Pagamento removido com sucesso' })
  async deletePayment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentService.deletePayment(id);
  }
}
