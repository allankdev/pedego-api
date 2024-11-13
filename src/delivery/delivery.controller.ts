import { Controller, Get, Param } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './delivery.entity';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get(':id')
  async getDelivery(@Param('id') id: number): Promise<Delivery> {
    return this.deliveryService.findOne(id);
  }
}
