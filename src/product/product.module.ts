// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Store } from '../store/store.entity';
import { Category } from '../category/category.entity';
import { StockModule } from '../stock/stock.module'; // 👈 Importa o módulo, não só a entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Store, Category]),
    StockModule, // 👈 Aqui é onde o ProductModule passa a ter acesso ao StockRepository e StockService
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
