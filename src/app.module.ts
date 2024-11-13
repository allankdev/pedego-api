import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreModule } from './store/store.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    // Configuração do TypeORM com PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // ou seu host de banco de dados
      port: 5432, // a porta padrão do PostgreSQL
      username: 'postgres', // seu usuário do PostgreSQL
      password: '1234', // sua senha do PostgreSQL
      database: 'pedego', // nome do seu banco de dados
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // caminho para as entidades
      synchronize: true, // sincronia automática (use com cuidado em produção)
    }),
    StoreModule,
    ProductModule,
    OrderModule,
    UserModule,
    DeliveryModule,
  ],
})
export class AppModule {}
