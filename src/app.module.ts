import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportModule } from './report/report.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PaymentModule } from './payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'pedego',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      poolSize: 5,
      connectTimeoutMS: 30000,
      logging: false,
      maxQueryExecutionTime: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    }),
    ReportModule,
    OrderModule,
    ProductModule,
    StoreModule,
    UserModule,
    DeliveryModule,
    PaymentModule,
    AuthModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
