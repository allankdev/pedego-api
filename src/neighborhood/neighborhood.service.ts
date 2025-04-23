// src/neighborhood/neighborhood.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Neighborhood } from './neighborhood.entity';
import { CreateNeighborhoodDto } from './dto/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from './dto/update-neighborhood.dto';
import { Store } from '../store/store.entity';

@Injectable()
export class NeighborhoodService {
  constructor(
    @InjectRepository(Neighborhood)
    private neighborhoodRepo: Repository<Neighborhood>,
    @InjectRepository(Store)
    private storeRepo: Repository<Store>,
  ) {}

  async create(storeId: number, dto: CreateNeighborhoodDto, user: any) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');
    if (user.role !== 'ADMIN' || user.store?.id !== storeId) {
      throw new ForbiddenException('Você não tem acesso a esta loja');
    }

    const neighborhood = this.neighborhoodRepo.create({ ...dto, store });
    return this.neighborhoodRepo.save(neighborhood);
  }

  async findAll(storeId: number, user: any) {
    if (user.role !== 'ADMIN' || user.store?.id !== storeId) {
      throw new ForbiddenException('Você não tem acesso a esta loja');
    }

    return this.neighborhoodRepo.find({
      where: { store: { id: storeId } },
      order: { name: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateNeighborhoodDto, user: any) {
    const neighborhood = await this.neighborhoodRepo.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!neighborhood) throw new NotFoundException('Bairro não encontrado');
    if (user.role !== 'ADMIN' || user.store?.id !== neighborhood.store.id) {
      throw new ForbiddenException('Você não tem permissão para editar este bairro');
    }

    Object.assign(neighborhood, dto);
    return this.neighborhoodRepo.save(neighborhood);
  }

  async remove(id: number, user: any) {
    const neighborhood = await this.neighborhoodRepo.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!neighborhood) throw new NotFoundException('Bairro não encontrado');
    if (user.role !== 'ADMIN' || user.store?.id !== neighborhood.store.id) {
      throw new ForbiddenException('Você não tem permissão para remover este bairro');
    }

    await this.neighborhoodRepo.remove(neighborhood);
    return { message: 'Bairro removido com sucesso' };
  }

  async toggleActive(id: number, active: boolean, user: any) {
    const neighborhood = await this.neighborhoodRepo.findOne({
      where: { id },
      relations: ['store'],
    });
  
    if (!neighborhood) throw new NotFoundException('Bairro não encontrado');
    if (user.role !== 'ADMIN' || user.store?.id !== neighborhood.store.id) {
      throw new ForbiddenException('Você não tem permissão para alterar este bairro');
    }
  
    neighborhood.active = active;
    return this.neighborhoodRepo.save(neighborhood);
  }
  
}
