import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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

  // (Opcional) Retorna todas as lojas
  async findAll(): Promise<Store[]> {
    return this.storeRepository.find();
  }

  // Cria uma nova loja
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    // Verifica se o subdomínio já existe
    const existingStore = await this.storeRepository.findOne({
      where: { subdomain: createStoreDto.subdomain },
    });

    if (existingStore) {
      throw new ConflictException(
        `O subdomínio '${createStoreDto.subdomain}' já está em uso.`,
      );
    }

    const newStore = this.storeRepository.create(createStoreDto);
    return this.storeRepository.save(newStore);
  }

  // Busca loja pelo subdomínio
  async findBySubdomain(subdomain: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada.`);
    }

    return store;
  }

  // Atualiza informações de uma loja via subdomínio
  async update(subdomain: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada para atualização.`);
    }

    // Se for alterar o subdomínio, checar se já existe igual
    if (
      updateStoreDto.subdomain &&
      updateStoreDto.subdomain !== store.subdomain
    ) {
      const existing = await this.storeRepository.findOne({
        where: { subdomain: updateStoreDto.subdomain },
      });
      if (existing) {
        throw new ConflictException(
          `O subdomínio '${updateStoreDto.subdomain}' já está em uso.`,
        );
      }
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  // Remove uma loja via subdomínio
  async remove(subdomain: string): Promise<void> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada para remoção.`);
    }

    await this.storeRepository.remove(store);
  }
}
