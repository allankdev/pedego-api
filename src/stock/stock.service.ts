import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async getStock(productId: number, restaurantId: number): Promise<Stock> {
    return this.stockRepository.findOne({ where: { productId, restaurantId } });
  }

  async updateStock(productId: number, restaurantId: number, quantity: number): Promise<void> {
    const stock = await this.getStock(productId, restaurantId);
    if (stock) {
      stock.quantity = quantity;
      await this.stockRepository.save(stock);
    } else {
      await this.stockRepository.save({ productId, restaurantId, quantity });
    }
  }
}