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
    private readonly stockRepository: Repository<Stock>,
  ) {}

  // Retorna o estoque de um produto específico em uma loja (store)
  async getStock(productId: number, storeId: number): Promise<Stock> {
    const stock = await this.stockRepository.findOne({
      where: { productId, storeId },
    });

    if (!stock) {
      throw new NotFoundException(
        `Estoque não encontrado para o produto ${productId} na loja ${storeId}`,
      );
    }

    return stock;
  }

  // Retorna todos os registros de estoque
  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find();
  }

  // Cria um novo estoque
  async create(createStockDto: CreateStockDto): Promise<Stock> {
    // createStockDto deve conter productId, storeId, quantity
    const newStock = this.stockRepository.create(createStockDto);
    return this.stockRepository.save(newStock);
  }

  // Atualiza a quantidade em estoque de um produto em uma loja
  async updateStock(productId: number, storeId: number, quantity: number): Promise<Stock> {
    // Reaproveita o getStock para verificar se existe
    const stock = await this.getStock(productId, storeId);
    stock.quantity = quantity;

    return this.stockRepository.save(stock);
  }

  // Remove o registro de estoque de um produto em uma loja
  async remove(productId: number, storeId: number): Promise<void> {
    const stock = await this.getStock(productId, storeId);
    await this.stockRepository.remove(stock);
  }
}
