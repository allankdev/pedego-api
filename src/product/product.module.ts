import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Store } from '../store/store.entity';
import { Category } from '../category/category.entity';
import { StockModule } from '../stock/stock.module';
import { ProductExtraModule } from '../product-extra/product-extra.module';
import { Stock } from '../stock/stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Store, Category, Stock]),
    StockModule,
    ProductExtraModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Exportar o service caso seja usado em outros módulos
})
export class ProductModule {}