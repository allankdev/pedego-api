import { Controller, Get, Param, Put, Body, Post, Delete } from '@nestjs/common';
import { StockService } from './stock.service';
import { Stock } from './stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

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

  // Endpoint para buscar todos os estoques
  @Get()
  async findAll(): Promise<Stock[]> {
    return this.stockService.findAll();
  }

  // Endpoint para criar um novo estoque
  @Post()
  async createStock(@Body() createStockDto: CreateStockDto): Promise<Stock> {
    return this.stockService.create(createStockDto);
  }

  // Endpoint para atualizar a quantidade de um produto no estoque
  @Put(':productId/:restaurantId')
  async updateStock(
    @Param('productId') productId: number,
    @Param('restaurantId') restaurantId: number,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    return this.stockService.updateStock(productId, restaurantId, updateStockDto.quantity);
  }

  // Endpoint para remover um estoque
  @Delete(':productId/:restaurantId')
  async removeStock(
    @Param('productId') productId: number,
    @Param('restaurantId') restaurantId: number,
  ): Promise<void> {
    return this.stockService.remove(productId, restaurantId);
  }
}
