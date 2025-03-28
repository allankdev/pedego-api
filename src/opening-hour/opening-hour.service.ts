// src/opening-hour/opening-hour.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpeningHour } from './opening-hour.entity';
import { Store } from '../store/store.entity';
import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';

@Injectable()
export class OpeningHourService {
  constructor(
    @InjectRepository(OpeningHour)
    private readonly openingHourRepo: Repository<OpeningHour>,

    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async create(storeId: number, dto: CreateOpeningHourDto) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    const hour = this.openingHourRepo.create({ ...dto, store });
    return this.openingHourRepo.save(hour);
  }

  async findAll(storeId: number) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    return this.openingHourRepo.find({ where: { store: { id: storeId } } });
  }

  async update(id: number, dto: UpdateOpeningHourDto) {
    const hour = await this.openingHourRepo.findOne({ where: { id }, relations: ['store'] });
    if (!hour) throw new NotFoundException('Horário não encontrado');

    Object.assign(hour, dto);
    return this.openingHourRepo.save(hour);
  }

  async remove(id: number) {
    const hour = await this.openingHourRepo.findOne({ where: { id } });
    if (!hour) throw new NotFoundException('Horário não encontrado');

    return this.openingHourRepo.remove(hour);
  }
}
