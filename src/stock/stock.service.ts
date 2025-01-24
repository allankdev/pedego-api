import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  // Método para buscar o estoque de um produto específico em um restaurante
  async getStock(productId: number, restaurantId: number): Promise<Stock> {
    const stock = await this.stockRepository.findOne({
      where: { productId, restaurantId },
    });

    if (!stock) {
      throw new NotFoundException(`Estoque não encontrado para o produto ${productId} no restaurante ${restaurantId}`);
    }

    return stock;
  }

  // Método para buscar todos os estoques
  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find();
  }

  // Método para criar um novo estoque
  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const newStock = this.stockRepository.create(createStockDto);
    return await this.stockRepository.save(newStock);
  }

  // Método para atualizar a quantidade de um produto no estoque
  async updateStock(productId: number, restaurantId: number, quantity: number): Promise<Stock> {
    const stock = await this.getStock(productId, restaurantId);
    
    stock.quantity = quantity;
    return await this.stockRepository.save(stock);
  }

  // Método para remover um estoque
  async remove(productId: number, restaurantId: number): Promise<void> {
    const stock = await this.getStock(productId, restaurantId);
    await this.stockRepository.remove(stock);
  }
}
