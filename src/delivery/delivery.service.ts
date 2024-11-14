import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './delivery.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  // Método para buscar uma entrega pelo ID
  async findOne(id: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new NotFoundException(`Entrega com ID ${id} não encontrado`);
    }

    return delivery;  // Retorna diretamente o objeto Delivery encontrado
  }

  // Método para buscar todas as entregas
  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.find();
  }
}
