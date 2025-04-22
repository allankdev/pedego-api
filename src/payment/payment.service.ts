import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findOne({
      where: { order: { id: createPaymentDto.orderId } },
      relations: ['order'],
    });

    if (existingPayment) {
      throw new ConflictException('Este pedido já possui um pagamento registrado.');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      order: { id: createPaymentDto.orderId },
      status: PaymentStatus.PAID,
    });

    return await this.paymentRepository.save(payment);
  }

  async getPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['order', 'order.store', 'order.user'],
    });
  }

  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'order.user', 'order.store'],
    });

    if (!payment) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    return payment;
  }

  async getPaymentsByStore(storeId: number): Promise<Payment[]> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.store', 'store')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('store.id = :storeId', { storeId })
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();
  }

  async updatePayment(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async cancelPayment(id: number): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    payment.status = PaymentStatus.CANCELED;
    return this.paymentRepository.save(payment);
  }

  async deletePayment(id: number): Promise<void> {
    const payment = await this.getPaymentById(id);
    await this.paymentRepository.remove(payment);
  }
}
