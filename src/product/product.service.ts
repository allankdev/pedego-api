import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Método para buscar todos os produtos
  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  // Método para buscar um produto pelo ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado`); // Exceção em português
    }

    return product; // Retorna o produto encontrado
  }
}
