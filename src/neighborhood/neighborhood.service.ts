// src/neighborhood/neighborhood.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(storeId: number, dto: CreateNeighborhoodDto) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    const neighborhood = this.neighborhoodRepo.create({ ...dto, store });
    return this.neighborhoodRepo.save(neighborhood);
  }

  async findAll(storeId: number) {
    return this.neighborhoodRepo.find({ where: { store: { id: storeId } } });
  }

  async update(id: number, dto: UpdateNeighborhoodDto) {
    await this.neighborhoodRepo.update(id, dto);
    return this.neighborhoodRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.neighborhoodRepo.delete(id);
  }
}
