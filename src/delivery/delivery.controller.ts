import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Entregas') // 🔹 Organiza no Swagger
@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as entregas' }) // 🔹 Descrição no Swagger
  @ApiResponse({ status: 200, description: 'Lista de entregas retornada com sucesso' })
  async findAll(): Promise<Delivery[]> {
    return await this.deliveryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma entrega pelo ID' }) // 🔹 Descrição no Swagger
  @ApiResponse({ status: 200, description: 'Entrega encontrada' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Delivery> {
    const delivery = await this.deliveryService.findOne(id);
    if (!delivery) {
      throw new NotFoundException(`Entrega com o ID ${id} não encontrada`);
    }
    return delivery;
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova entrega' })
  @ApiBody({ type: CreateDeliveryDto }) // 🔹 Exibe corretamente o request body no Swagger
  @ApiResponse({ status: 201, description: 'Entrega criada com sucesso' })
  async create(@Body() createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    return await this.deliveryService.create(createDeliveryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma entrega pelo ID' })
  @ApiBody({ type: UpdateDeliveryDto }) // 🔹 Exibe corretamente o request body no Swagger
  @ApiResponse({ status: 200, description: 'Entrega atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDeliveryDto: UpdateDeliveryDto
  ): Promise<Delivery> {
    return await this.deliveryService.update(id, updateDeliveryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta uma entrega pelo ID' })
  @ApiResponse({ status: 200, description: 'Entrega deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deliveryService.remove(id);
  }
}
