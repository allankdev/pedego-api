import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // Rota para buscar todas as entregas
  @Get()
  async findAll(): Promise<Delivery[]> {
    return await this.deliveryService.findAll();
  }

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

  // Rota para criar uma nova entrega
  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    return await this.deliveryService.create(createDeliveryDto);
  }

  // Rota para atualizar uma entrega pelo ID
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery> {
    return await this.deliveryService.update(id, updateDeliveryDto);
  }

  // Rota para deletar uma entrega pelo ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.deliveryService.remove(id);
  }
}
