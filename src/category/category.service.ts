import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // 🔥 findAll agora é público
  async findAll(storeId: number) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    return this.categoryRepository.find({
      where: { store: { id: storeId } },
      order: { name: 'ASC' },
    });
  }

  // 🔥 findAll para admin autenticado (GET /my-store)
  async findAllForAuthenticated(storeId: number, user: any) {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    if (user.role !== 'ADMIN' || user.store?.id !== storeId) {
      throw new ForbiddenException('Acesso negado à loja');
    }

    return this.categoryRepository.find({
      where: { store: { id: storeId } },
      order: { name: 'ASC' },
    });
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
}
