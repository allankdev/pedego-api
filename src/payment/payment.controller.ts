import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Cria um novo pagamento
  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  // Obtém todos os pagamentos
  @Get()
  async getPayments(): Promise<Payment[]> {
    return this.paymentService.getPayments();
  }

  // Obtém um pagamento específico pelo ID
  @Get(':id')
  async getPaymentById(@Param('id') id: number): Promise<Payment> {
    return this.paymentService.getPaymentById(id);
  }

  // Atualiza um pagamento
  @Put(':id')
  async updatePayment(@Param('id') id: number, @Body() updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    return this.paymentService.updatePayment(id, updatePaymentDto);
  }

  // Remove um pagamento
  @Delete(':id')
  async deletePayment(@Param('id') id: number): Promise<void> {
    return this.paymentService.deletePayment(id);
  }
}
