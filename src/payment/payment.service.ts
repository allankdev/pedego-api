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
  CreatePaymentDto,
  PaymentStatus,
  PaymentType,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { type, orderId, userId } = createPaymentDto;

    // Validação de campos obrigatórios
    if (type === PaymentType.ORDER && !orderId) {
      throw new BadRequestException('orderId é obrigatório para pagamentos de pedido');
    }

    if (type === PaymentType.SUBSCRIPTION && !userId) {
      throw new BadRequestException('userId é obrigatório para pagamentos de assinatura');
    }

    // Verifica duplicidade só se for pagamento de pedido
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
      status: PaymentStatus.PAID, // ou PENDING, dependendo do contexto
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
