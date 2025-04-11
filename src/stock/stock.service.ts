import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Product } from '../product/product.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Retorna o estoque de um produto específico em uma loja
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

  // Retorna todos os estoques
  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find({ relations: ['product'] });
  }

  // Retorna todos os estoques de uma loja específica
  async findByStoreId(storeId: number): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { storeId },
      relations: ['product'],
    });
  }

  // Cria novo estoque
  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const newStock = this.stockRepository.create(createStockDto);
    const saved = await this.stockRepository.save(newStock);

    // Se o produto estiver com controle de estoque e a quantidade for 0, desativa o produto
    await this.handleProductAvailability(saved.productId, saved.quantity);

    return saved;
  }

  // Atualiza a quantidade de estoque e disponibilidade do produto
  async updateStock(productId: number, storeId: number, quantity: number): Promise<Stock> {
    if (quantity < 0) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'A quantidade de estoque não pode ser negativa.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const stock = await this.getStock(productId, storeId);
    stock.quantity = quantity;

    const updated = await this.stockRepository.save(stock);

    // Atualizar a disponibilidade do produto
    await this.handleProductAvailability(productId, quantity);

    return updated;
  }

  // Remove um registro de estoque
  async remove(productId: number, storeId: number): Promise<void> {
    const stock = await this.getStock(productId, storeId);
    await this.stockRepository.remove(stock);

    // Atualizar a disponibilidade do produto ao remover o estoque
    await this.handleProductAvailability(productId, 0);
  }

  // Verifica e atualiza a disponibilidade do produto com base no estoque
  private async handleProductAvailability(productId: number, quantity: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) return;

    // Se o produto tiver controle de estoque, atualize a disponibilidade
    if (product.hasStockControl) {
      const shouldBeAvailable = quantity > 0;
      if (product.available !== shouldBeAvailable) {
        product.available = shouldBeAvailable;
        await this.productRepository.save(product);
      }
    }
  }
}
