import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductExtraGroup } from './product-extra-group.entity';
import { ProductExtra } from './product-extra.entity';
import { ProductExtraService } from './product-extra.service';
import { ProductExtraController } from './product-extra.controller';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductExtraGroup, ProductExtra, Product])],
  providers: [ProductExtraService],
  controllers: [ProductExtraController],
  exports: [
    ProductExtraService,
    TypeOrmModule, // ✅ exporta os repositórios para uso externo (como OrderModule)
  ],
})
export class ProductExtraModule {}
