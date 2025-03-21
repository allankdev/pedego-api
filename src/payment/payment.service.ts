import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  // Criar novo pagamento (vinculado a um pedido)
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const existingPayment = await this.paymentRepository.findOne({
      where: { order: { id: createPaymentDto.orderId } },
      relations: ['order'],
    });

    if (existingPayment) {
      throw new ConflictException(`Este pedido já possui um pagamento registrado.`);
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      order: { id: createPaymentDto.orderId }, // Relacionamento por ID
    });

    return await this.paymentRepository.save(payment);
  }

  // Listar todos os pagamentos (com dados do pedido incluso)
  async getPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['order'], // inclui dados do pedido
    });
  }

  // Buscar um pagamento específico com seu pedido relacionado
  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'], // inclui dados do pedido
    });

    if (!payment) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    return payment;
  }

  // Atualizar um pagamento
  async updatePayment(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  // Deletar um pagamento
  async deletePayment(id: number): Promise<void> {
    const payment = await this.getPaymentById(id);
    await this.paymentRepository.remove(payment);
  }
}
