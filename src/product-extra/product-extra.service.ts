import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductExtraGroup } from './product-extra-group.entity';
import { ProductExtra } from './product-extra.entity';
import { CreateProductExtraGroupDto } from './dto/create-product-extra-group.dto';
import { UpdateProductExtraGroupDto } from './dto/update-product-extra-group.dto';
import { Product } from '../product/product.entity';

@Injectable()
export class ProductExtraService {
  constructor(
    @InjectRepository(ProductExtraGroup)
    private groupRepo: Repository<ProductExtraGroup>,

    @InjectRepository(ProductExtra)
    private extraRepo: Repository<ProductExtra>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async createGroup(dto: CreateProductExtraGroupDto): Promise<ProductExtraGroup> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const extras = dto.extras.map((extra) =>
      this.extraRepo.create({
        name: extra.name,
        description: extra.description,
        price: extra.price,
        available: extra.available ?? true,
      }),
    );

    const group = this.groupRepo.create({
      title: dto.title,
      required: dto.required,
      maxSelection: dto.maxSelection,
      product,
      extras,
    });

    return await this.groupRepo.save(group);
  }

  async updateGroup(id: number, dto: UpdateProductExtraGroupDto): Promise<ProductExtraGroup> {
    const group = await this.groupRepo.findOne({ where: { id }, relations: ['extras'] });
    if (!group) throw new NotFoundException('Grupo de extra não encontrado');

    group.title = dto.title;
    group.required = dto.required;
    group.maxSelection = dto.maxSelection;

    if (dto.extras) {
      const updatedExtras = dto.extras.map((extra) =>
        this.extraRepo.create({
          id: extra.id,
          name: extra.name,
          description: extra.description,
          price: extra.price,
          available: extra.available ?? true,
        })
      );
      group.extras = updatedExtras;
    }
    return await this.groupRepo.save(group);
  }


  async removeAllGroupsByProductId(productId: number): Promise<void> {
    const groups = await this.groupRepo.find({
      where: { product: { id: productId } },
      relations: ['extras'],
    });
  
    for (const group of groups) {
      // Remove todos os extras associados ao grupo
      if (group.extras && group.extras.length > 0) {
        await this.extraRepo.remove(group.extras);
      }
    }
  
    // Agora remove os grupos
    await this.groupRepo.remove(groups);
  }
  
  


  

  async removeGroup(id: number): Promise<void> {
    await this.groupRepo.delete(id);
  }

  async findByProduct(productId: number): Promise<ProductExtraGroup[]> {
    return this.groupRepo.find({
      where: { product: { id: productId } },
      relations: ['extras'],
      order: {
        id: 'ASC',
        extras: {
          id: 'ASC',
        },
      },
    });
  }
}