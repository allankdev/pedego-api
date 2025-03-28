import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from '../category/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'store'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'store'],
    });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...data } = createProductDto;

    const product = this.productRepository.create(data);

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Categoria não encontrada');
      product.category = category;
    }

    return this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado para atualização`);
    }

    const { categoryId, ...data } = updateProductDto;

    Object.assign(product, data);

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Categoria não encontrada');
      product.category = category;
    }

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado para remoção`);
    }

    await this.productRepository.remove(product);
  }
}
