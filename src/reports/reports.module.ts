import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity'; // ✅ IMPORTAR
import { Payment } from '../payment/payment.entity';
import { Stock } from '../stock/stock.entity'; // ✅ IMPORTAR
import { Product } from '../product/product.entity';
import { Neighborhood } from '../neighborhood/neighborhood.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem, // ✅ ADICIONAR AQUI
      Stock,      // ✅ E TAMBÉM AQUI
      Payment,
      Product,
      Neighborhood,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
