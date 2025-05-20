import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './category.entity';
import { Store } from '../store/store.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(storeId: number, dto: CreateCategoryDto, user: any) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    if (user.role !== 'ADMIN' || user.store?.id !== storeId) {
      throw new ForbiddenException('Acesso negado à loja');
    }

    const category = this.categoryRepository.create({
      ...dto,
      store,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(storeId: number) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    return this.categoryRepository.find({
      where: { store: { id: storeId } },
      order: { position: 'ASC', name: 'ASC' },
    });
  }

  async findAllForAuthenticated(storeId: number, user: any) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    if (user.role !== 'ADMIN' || user.store?.id !== storeId) {
      throw new ForbiddenException('Acesso negado à loja');
    }

    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.store', 'store')
      .leftJoin('category.products', 'product')
      .where('store.id = :storeId', { storeId })
      .loadRelationCountAndMap('category.productCount', 'category.products')
      .orderBy('category.position', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .getMany();

    return categories;
  }

  async update(id: number, dto: UpdateCategoryDto, user: any) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!category) throw new NotFoundException('Categoria não encontrada');

    if (user.role !== 'ADMIN' || user.store?.id !== category.store.id) {
      throw new ForbiddenException('Você não pode editar esta categoria');
    }

    Object.assign(category, dto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number, user: any) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!category) throw new NotFoundException('Categoria não encontrada');

    if (user.role !== 'ADMIN' || user.store?.id !== category.store.id) {
      throw new ForbiddenException('Você não pode remover esta categoria');
    }

    await this.categoryRepository.remove(category);
    return { message: 'Categoria removida com sucesso' };
  }

  async reorder(
    
    storeId: number,
    dto: { id: number; position: number }[],
    user: any,
  ) {
    try {
      const store = await this.storeRepository.findOne({ where: { id: storeId } });
      if (!store) throw new NotFoundException('Loja não encontrada');
  
      if (user.role !== 'ADMIN' || user.store?.id !== storeId) {
        throw new ForbiddenException('Acesso negado à loja');
      }
  
      const categoryIds = dto.map((item) => item.id);
  
      const categories = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoin('category.store', 'store')
        .where('category.id IN (:...ids)', { ids: categoryIds })
        .andWhere('store.id = :storeId', { storeId })
        .getMany();
  
        if (categories.length !== categoryIds.length) {
          const encontrados = categories.map((c) => c.id)
          const faltando = categoryIds.filter((id) => !encontrados.includes(id))
          console.error('Categorias não encontradas:', faltando)
          throw new BadRequestException(`Categorias não encontradas: ${faltando.join(', ')}`)
        }
        
  
      const updates = dto.map(({ id, position }) => {
        const category = categories.find((c) => c.id === id);
        if (!category) throw new NotFoundException(`Categoria ${id} não encontrada`);
        category.position = position;
        return category;
      });
  
      return await this.categoryRepository.manager.transaction(async (manager) => {
        return await manager.save(Category, updates);
      });
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Não foi possível salvar a nova ordem. Erro interno.');
    }
  }

  async findWithProducts(storeId: number) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } })
    if (!store) throw new NotFoundException('Loja não encontrada')
  
    const categories = await this.categoryRepository.find({
      where: { store: { id: storeId } },
      relations: ['products'],
      order: {
        position: 'ASC',
        name: 'ASC',
        products: {
          position: 'ASC',
          name: 'ASC',
        },
      },
    })
  
    // Filtrar produtos indisponíveis
    const filtered = categories.map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => p.available),
    }))
  
    return filtered
  }
  
}
