// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',         // ✅ ajuste se necessário
  password: '1234',         // ✅ ajuste se necessário
  database: 'pedego',           // ✅ nome do banco recriado
  synchronize: false,
  logging: false,
  entities: ['src/**/*.entity.ts'],         // glob de entidades
  migrations: ['src/migrations/*.ts'],      // glob de migrations
  migrationsTableName: 'migrations',
});
