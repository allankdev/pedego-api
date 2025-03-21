import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  // Método para buscar todas as entregas
  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepository.find();
  }

  // Método para buscar uma entrega pelo ID
  async findOne(id: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new NotFoundException(`Entrega com ID ${id} não encontrada`);
    }

    return delivery;
  }

  // Método para criar uma nova entrega
  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    const newDelivery = this.deliveryRepository.create(createDeliveryDto);
    return await this.deliveryRepository.save(newDelivery);
  }

  // Método para atualizar uma entrega pelo ID
  async update(id: number, updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);

    Object.assign(delivery, updateDeliveryDto);
    return await this.deliveryRepository.save(delivery);
  }

  // Método para remover uma entrega pelo ID
  async remove(id: number): Promise<void> {
    const delivery = await this.findOne(id);
    await this.deliveryRepository.remove(delivery);
  }
}
