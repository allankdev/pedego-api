import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from './payment.entity'; // ✅ Corrigido: importar da própria entidade

import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { type, orderId, userId } = createPaymentDto;

    if (type === PaymentType.ORDER && !orderId) {
      throw new BadRequestException('orderId é obrigatório para pagamentos de pedido');
    }

    if (type === PaymentType.SUBSCRIPTION && !userId) {
      throw new BadRequestException('userId é obrigatório para pagamentos de assinatura');
    }

    if (type === PaymentType.ORDER && orderId) {
      const existingPayment = await this.paymentRepository.findOne({
        where: { order: { id: orderId } },
        relations: ['order'],
      });

      if (existingPayment) {
        throw new ConflictException('Este pedido já possui um pagamento registrado.');
      }
    }

    const payment = this.paymentRepository.create({
      amount: createPaymentDto.amount,
      paymentMethod: createPaymentDto.paymentMethod,
      type: createPaymentDto.type,
      status: PaymentStatus.PAID,
      order: orderId ? { id: orderId } : undefined,
      userId: userId ?? undefined,
      stripeTransactionId: createPaymentDto.stripeTransactionId,
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
      .andWhere('payment.type = :type', { type: PaymentType.ORDER })
      .andWhere('order.status != :status', { status: 'cancelado' }) // 👈 Exclui pagamentos de pedidos cancelados
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();
  }
  

  async getSubscriptionPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { type: PaymentType.SUBSCRIPTION },
      order: { paymentDate: 'DESC' },
    });
  }

  async updatePayment(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async cancelPayment(id: number): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    payment.status = PaymentStatus.CANCELLED;
    return this.paymentRepository.save(payment);
  }

  async confirmPayment(id: number): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Pagamento já está confirmado ou foi cancelado.');
    }

    payment.status = PaymentStatus.PAID;
    return await this.paymentRepository.save(payment);
  }

  async deletePayment(id: number): Promise<void> {
    const payment = await this.getPaymentById(id);
    await this.paymentRepository.remove(payment);
  }
}
