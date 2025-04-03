import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Stock } from '../stock/stock.entity'; 
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  private readonly s3: S3Client;
  private readonly bucket = process.env.R2_BUCKET;
  private readonly publicUrl = 'https://pub-89335a236e764dca827836a2c27c4115.r2.dev';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
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

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'store'],
    });
  }

  async findByStoreId(storeId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { store: { id: storeId } },
      relations: ['category', 'store'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'store'],
    });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado`);
    }

    return product;
  }

  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const { categoryId, storeId, ...data } = createProductDto;
  
    const product = this.productRepository.create(data);
  
    // ✅ Associa categoria, se informada
    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Categoria não encontrada');
      product.category = category;
    }
  
    // ✅ Busca e associa a loja
    if (storeId) {
      const store = await this.productRepository.manager.findOne('Store', {
        where: { id: storeId },
      });
      if (!store) throw new NotFoundException('Loja não encontrada');
      product.store = store as any;
    } else {
      throw new NotFoundException('StoreId é obrigatório');
    }
  
    // ✅ Upload da imagem (se existir)
    if (file) {
      const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;
  
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        product.imageId = filename;
      } catch (error) {
        console.error('Erro ao enviar imagem para o R2:', error);
        throw new InternalServerErrorException('Falha no upload da imagem');
      }
    }
  
    return this.productRepository.save(product);
  }
  

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Produto com o ID ${id} não encontrado para atualização`);
    }

    const { categoryId, ...data } = updateProductDto;
    Object.assign(product, data);

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Categoria não encontrada');
      product.category = category;
    }

    if (file) {
      if (product.imageId) {
        try {
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: this.bucket,
              Key: product.imageId,
            }),
          );
        } catch (err) {
          console.error('Erro ao remover imagem anterior do R2:', err);
        }
      }

      const filename = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;

      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        product.imageId = filename;
      } catch (error) {
        console.error('Erro ao fazer upload da nova imagem:', error);
        throw new InternalServerErrorException('Falha ao atualizar a imagem do produto');
      }
    }

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
  
      if (!product) {
        throw new NotFoundException(`Produto com o ID ${id} não encontrado para remoção`);
      }
  
      console.log('🟢 Produto encontrado:', product);
  
      // Tenta remover o estoque vinculado
      const stockResult = await this.stockRepository.delete({ productId: id });
      console.log('🗑️ Estoque deletado:', stockResult);
  
      // Remove imagem se existir
      if (product.imageId) {
        try {
          console.log('🎯 Tentando remover imagem:', product.imageId);
          await this.s3.send(
            new DeleteObjectCommand({
              Bucket: this.bucket,
              Key: product.imageId,
            }),
          );
          console.log('✅ Imagem removida do R2');
        } catch (err) {
          console.error('⚠️ Erro ao remover imagem da R2:', err);
        }
      }
  
      // Remove o produto
      await this.productRepository.remove(product);
      console.log('✅ Produto removido com sucesso');
    } catch (error) {
      console.error('❌ ERRO AO REMOVER PRODUTO:', error);
      throw new InternalServerErrorException('Erro ao remover produto');
    }
  }
  
}
  
