// src/stock/stock.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { Stock } from './stock.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, Product])],
  providers: [StockService],
  controllers: [StockController],
  exports: [TypeOrmModule, StockService], // 👈 permite que outros módulos usem o repo e serviço
})
export class StockModule {}
