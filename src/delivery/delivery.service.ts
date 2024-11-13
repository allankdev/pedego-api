import { Injectable } from '@nestjs/common';
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
    return this.deliveryRepository.findOne({ where: { id } });  // Usando `where` corretamente
  }
}
