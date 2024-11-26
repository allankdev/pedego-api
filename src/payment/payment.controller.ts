import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() payment: Payment): Promise<Payment> {
    return this.paymentService.createPayment(payment.orderId, payment.paymentMethod, payment.amount);
  }

  @Get()
  async getPayments(): Promise<Payment[]> {
    return this.paymentService.getPayments();
  }
}