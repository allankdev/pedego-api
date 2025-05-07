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
    const saved = await this.openingHourRepo.save(hour);

    await this.reevaluateStoreOpenStatus(store);
    return saved;
  }

  async findAll(storeId: number) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    const horas = await this.openingHourRepo.find({
      where: { store: { id: storeId } },
    });

    const diaOrdem = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    return horas.sort((a, b) => diaOrdem.indexOf(a.day) - diaOrdem.indexOf(b.day));
  }

  async findAllForAuthenticated(storeId: number, user: any) {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Loja não encontrada');

    if (user.role !== 'ADMIN' || store.id !== user.store?.id) {
      throw new ForbiddenException('Acesso negado à listagem de horários.');
    }

    const horas = await this.openingHourRepo.find({
      where: { store: { id: storeId } },
    });

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
    const saved = await this.openingHourRepo.save(hour);

    await this.reevaluateStoreOpenStatus(hour.store);
    return saved;
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

    await this.openingHourRepo.remove(hour);
    await this.reevaluateStoreOpenStatus(hour.store);
  }

  // 🔁 Atualiza automaticamente o status da loja com base nos horários
  private async reevaluateStoreOpenStatus(store: Store) {
    if (store.manualOverride) return; // 👉 Não atualiza se estiver em modo manual
  
    const now = new Date();
    const currentDay = now.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm
  
    const hours = await this.openingHourRepo.find({ where: { store: { id: store.id } } });
    const today = hours.find(h => h.day.toLowerCase() === currentDay);
  
    const isOpen = today ? today.open <= currentTime && currentTime <= today.close : false;
  
    if (store.isOpen !== isOpen) {
      store.isOpen = isOpen;
      await this.storeRepo.save(store);
    }
  }
  
}
