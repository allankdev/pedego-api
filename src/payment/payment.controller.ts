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
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo pagamento' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso', type: Payment })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada com sucesso', type: [Payment] })
  async getPayments(): Promise<Payment[]> {
    return this.paymentService.getPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado com sucesso', type: Payment })
  async getPaymentById(@Param('id', ParseIntPipe) id: number): Promise<Payment> {
    return this.paymentService.getPaymentById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um pagamento existente' })
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
  @ApiOperation({ summary: 'Remove um pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento removido com sucesso' })
  async deletePayment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentService.deletePayment(id);
  }
}
