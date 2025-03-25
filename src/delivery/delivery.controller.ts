import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Entregas')
@ApiBearerAuth('access-token')
@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // ✅ Pode personalizar depois, se necessário
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as entregas (somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de entregas retornada com sucesso', type: [Delivery] })
  async findAll(): Promise<Delivery[]> {
    return await this.deliveryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma entrega pelo ID' })
  @ApiResponse({ status: 200, description: 'Entrega encontrada', type: Delivery })
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
  @ApiBody({ type: CreateDeliveryDto })
  @ApiResponse({ status: 201, description: 'Entrega criada com sucesso', type: Delivery })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    return await this.deliveryService.create(createDeliveryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma entrega pelo ID' })
  @ApiBody({ type: UpdateDeliveryDto })
  @ApiResponse({ status: 200, description: 'Entrega atualizada com sucesso', type: Delivery })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ): Promise<Delivery> {
    return await this.deliveryService.update(id, updateDeliveryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma entrega pelo ID' })
  @ApiResponse({ status: 200, description: 'Entrega removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.deliveryService.remove(id);
  }
}
