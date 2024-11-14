import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './delivery.entity';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // Rota para buscar uma entrega pelo ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Delivery> {
    try {
      return await this.deliveryService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Entrega com o ID ${id} não encontrada`);
      }
      throw error;
    }
  }

  // Rota para buscar todas as entregas
  @Get()
  async findAll(): Promise<Delivery[]> {
    return await this.deliveryService.findAll();
  }
}
