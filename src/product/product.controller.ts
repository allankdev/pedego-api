import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Rota para buscar todos os produtos
  @Get()
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  // Rota para buscar um produto pelo ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product> {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Produto com o ID ${id} não encontrado`); // Exceção em português
      }
      throw error;
    }
  }
}
