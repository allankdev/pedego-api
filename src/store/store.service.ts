import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find();
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
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

  async findBySubdomain(subdomain: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada.`);
    }

    return store;
  }

  async update(
    subdomain: string,
    updateStoreDto: UpdateStoreDto,
    user: { role: string; store?: { subdomain: string } },
  ): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada para atualização.`);
    }

    // Verifica se o usuário tem permissão para atualizar a loja
    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    // Atualiza as formas de pagamento se presentes
    if (updateStoreDto.paymentMethods) {
      store.paymentMethods = updateStoreDto.paymentMethods;
    }

    // Atualiza outras propriedades da loja
    Object.assign(store, updateStoreDto);

    return this.storeRepository.save(store);
  }

  async toggleOpen(subdomain: string, user: { role: string; store?: { subdomain: string } }): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada.`);
    }

    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para alterar o status desta loja.');
    }

    store.isOpen = !store.isOpen;
    return this.storeRepository.save(store);
  }

  async remove(subdomain: string): Promise<void> {
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada para remoção.`);
    }

    await this.storeRepository.remove(store);
  }
}
