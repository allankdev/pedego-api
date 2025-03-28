// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Store } from '../store/store.entity';
import { Category } from '../category/category.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Product, Store,Category])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
