import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { UpdateProductDto } from './dto/update-product.dto'; // Supondo que você tenha o DTO para atualização
import { CreateProductDto } from './dto/create-product.dto'; // Supondo que você tenha o DTO para criar produto

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

  // Método para criar um novo produto
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto); // Cria uma nova instância do produto com os dados do DTO
    return this.productRepository.save(product); // Salva o novo produto no banco de dados
  }

  // Método para atualizar um produto
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado para atualização`);
    }

    // Atualiza as propriedades do produto com os dados do DTO
    Object.assign(product, updateProductDto);

    // Salva o produto atualizado no banco de dados
    return this.productRepository.save(product);
  }

  // Método para remover um produto
  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado para remoção`);
    }

    // Remove o produto do banco de dados
    await this.productRepository.remove(product);
  }
}
