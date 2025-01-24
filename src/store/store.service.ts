import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  // Criar uma nova loja
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const existingStore = await this.storeRepository.findOne({
      where: { subdomain: createStoreDto.subdomain },
    });

    if (existingStore) {
      throw new ConflictException(`O subdomínio '${createStoreDto.subdomain}' já está em uso.`);
    }

    const newStore = this.storeRepository.create(createStoreDto);
    return this.storeRepository.save(newStore);
  }

  // Buscar loja pelo subdomínio
  async findBySubdomain(subdomain: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada`);
    }

    return store;
  }

  // Atualizar informações de uma loja
  async update(
    subdomain: string,
    updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada`);
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  // Remover uma loja
  async remove(subdomain: string): Promise<void> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada`);
    }

    await this.storeRepository.remove(store);
  }
}
