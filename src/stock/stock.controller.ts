import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { StockService } from './stock.service';
import { Stock } from './stock.entity';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // Endpoint para obter o estoque de um produto específico
  @Get(':productId/:restaurantId')
  async getStock(
    @Param('productId') productId: number,
    @Param('restaurantId') restaurantId: number,
  ): Promise<Stock> {
    return this.stockService.getStock(productId, restaurantId);
  }

  // Endpoint para atualizar a quantidade de um produto no estoque
  @Put(':productId/:restaurantId')
  async updateStock(
    @Param('productId') productId: number,
    @Param('restaurantId') restaurantId: number,
    @Body('quantity') quantity: number,
  ): Promise<void> {
    return this.stockService.updateStock(productId, restaurantId, quantity);
  }
}
