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
    const store = await this.storeRepository.findOne({ where: { subdomain } });

    if (!store) {
      throw new NotFoundException(`Loja '${subdomain}' não encontrada.`);
    }

    if (user.role !== 'ADMIN' || user.store?.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;

    if (store.avatarImageId) {
      try {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: store.avatarImageId,
          }),
        );
      } catch (error) {
        console.error('Erro ao excluir avatar antigo da R2:', error);
      }
    }

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      store.avatarImageId = filename;
    } catch (error) {
      console.error('Erro ao enviar avatar para R2:', error);
      throw new InternalServerErrorException('Erro ao salvar imagem da loja');
    }

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

    if (store.avatarImageId) {
      try {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: store.avatarImageId,
          }),
        );
      } catch (error) {
        console.error('Erro ao excluir avatar da loja ao remover:', error);
      }
    }

    await this.storeRepository.remove(store);
  }
}
