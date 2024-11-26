import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(orderId: number, paymentMethod: string, amount: number): Promise<Payment> {
    const payment = new Payment();
    payment.orderId = orderId;
    payment.paymentMethod = paymentMethod;
    payment.amount = amount;
    payment.paymentDate = new Date();
    return this.paymentRepository.save(payment);
  }

  async getPayments(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }
}