import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Store } from '../store/store.entity';
import { Category } from '../category/category.entity';
import { StockModule } from '../stock/stock.module';
import { ProductExtraModule } from '../product-extra/product-extra.module'; // ✅ Importar aqui
import { Stock } from '../stock/stock.entity';  // ✅ Importar a entidade Stock

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Store, Category, Stock]),  // ✅ Adicionar Stock aqui
    StockModule,
    ProductExtraModule, // ✅ IMPORTAÇÃO ADICIONADA
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
