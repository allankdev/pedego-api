import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

@Injectable()
export class StoreService {
  private readonly s3: S3Client;
  private readonly bucket = process.env.R2_BUCKET;
  private readonly publicUrl = 'https://pub-89335a236e764dca827836a2c27c4115.r2.dev';

  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {
    this.s3 = new S3Client({
      region: process.env.R2_REGION,
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
      },
    });
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find();
  }

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

  async findBySubdomain(subdomain: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { subdomain },
      relations: ['openingHours'],
    });
  
    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada.`);
    }
  
    const now = dayjs().locale('pt-br');
    const currentDay = now.format('dddd');
    const currentTime = now.format('HH:mm');
  
    const todayHour = store.openingHours.find(
      (h) => h.day.toLowerCase() === currentDay,
    );
  
    const isNowWithinOpening =
      todayHour && todayHour.open <= currentTime && currentTime <= todayHour.close;
  
    // 🔁 Caso esteja em modo manual, mas agora o horário da loja já bate com o automático,
    // remove o override e volta a seguir os horários definidos
    if (store.manualOverride && store.isOpen !== isNowWithinOpening) {
      store.manualOverride = false;
      store.isOpen = isNowWithinOpening;
      await this.storeRepository.save(store);
    }
  
    // ⚙️ Se estiver em modo automático, sincroniza com o horário
    if (!store.manualOverride && store.isOpen !== isNowWithinOpening) {
      store.isOpen = isNowWithinOpening;
      await this.storeRepository.save(store);
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

    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    if (updateStoreDto.paymentMethods) {
      store.paymentMethods = updateStoreDto.paymentMethods;
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async updateAvatar(
    subdomain: string,
    user: { role: string; store?: { subdomain: string } },
    file: Express.Multer.File,
  ): Promise<Store> {
    const store = await this.findBySubdomain(subdomain);

    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;

    if (store.avatarImageId) {
      await this.deleteImage(store.avatarImageId);
    }

    await this.uploadImage(file, filename);

    store.avatarImageId = filename;
    return this.storeRepository.save(store);
  }

  async updateCover(
    subdomain: string,
    user: { role: string; store?: { subdomain: string } },
    file: Express.Multer.File,
  ): Promise<Store> {
    const store = await this.findBySubdomain(subdomain);

    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;

    if (store.coverImageId) {
      await this.deleteImage(store.coverImageId);
    }

    await this.uploadImage(file, filename);

    store.coverImageId = filename;
    return this.storeRepository.save(store);
  }

  // 🔒 Sem efeito real: apenas retorna o status atual
  async toggleOpen(
    subdomain: string,
    user: { role: string; store?: { subdomain: string } },
    auto = false,
  ): Promise<Store> {
    const store = await this.findBySubdomain(subdomain);
  
    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para alterar o status desta loja.');
    }
  
    const now = dayjs().locale('pt-br');
    const currentDay = now.format('dddd');
    const currentTime = now.format('HH:mm');
  
    const todayHour = store.openingHours.find(
      (h) => h.day.toLowerCase() === currentDay,
    );
  
    const isNowWithinOpening =
      todayHour && todayHour.open <= currentTime && currentTime <= todayHour.close;
  
    if (auto) {
      // Modo automático: reseta manualOverride e ajusta o status conforme horário
      store.manualOverride = false;
      store.isOpen = isNowWithinOpening;
    } else {
      // Modo manual: alterna o status de aberto/fechado
      store.manualOverride = true;
      store.isOpen = !store.isOpen;
    }
  
    return this.storeRepository.save(store);
  }
  
  

  async remove(subdomain: string): Promise<void> {
    const store = await this.findBySubdomain(subdomain);

    if (store.avatarImageId) {
      await this.deleteImage(store.avatarImageId);
    }

    if (store.coverImageId) {
      await this.deleteImage(store.coverImageId);
    }

    await this.storeRepository.remove(store);
  }

  private async uploadImage(file: Express.Multer.File, filename: string): Promise<void> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      console.error('Erro ao fazer upload para R2:', error);
      throw new InternalServerErrorException('Erro ao enviar imagem');
    }
  }

  private async deleteImage(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Erro ao deletar imagem da R2:', error);
    }
  }
}
