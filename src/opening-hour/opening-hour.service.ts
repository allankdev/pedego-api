// src/opening-hour/opening-hour.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  async create(storeId: number, dto: CreateOpeningHourDto, user: any) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    if (user.role !== 'ADMIN' || store.id !== user.store?.id) {
      throw new ForbiddenException('Acesso negado à criação de horário.');
    }

    const hour = this.openingHourRepo.create({ ...dto, store });
    return this.openingHourRepo.save(hour);
  }

  async findAll(storeId: number, user: any) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    if (user.role !== 'ADMIN' || store.id !== user.store?.id) {
      throw new ForbiddenException('Acesso negado à listagem de horários.');
    }

    const horas = await this.openingHourRepo.find({
      where: { store: { id: storeId } },
    });

    // Ordenar manualmente com base nos dias da semana
    const diaOrdem = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    return horas.sort((a, b) => diaOrdem.indexOf(a.day) - diaOrdem.indexOf(b.day));
  }

  async update(id: number, dto: UpdateOpeningHourDto, user: any) {
    const hour = await this.openingHourRepo.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!hour) throw new NotFoundException('Horário não encontrado');

    if (user.role !== 'ADMIN' || hour.store.id !== user.store?.id) {
      throw new ForbiddenException('Acesso negado à atualização de horário.');
    }

    Object.assign(hour, dto);
    return this.openingHourRepo.save(hour);
  }

  async remove(id: number, user: any) {
    const hour = await this.openingHourRepo.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!hour) throw new NotFoundException('Horário não encontrado');

    if (user.role !== 'ADMIN' || hour.store.id !== user.store?.id) {
      throw new ForbiddenException('Acesso negado à exclusão de horário.');
    }

    return this.openingHourRepo.remove(hour);
  }
}
