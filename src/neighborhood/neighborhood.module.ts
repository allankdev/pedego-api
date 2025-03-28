// src/neighborhood/neighborhood.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Neighborhood } from './neighborhood.entity';
import { NeighborhoodService } from './neighborhood.service';
import { NeighborhoodController } from './neighborhood.controller';
import { Store } from '../store/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Neighborhood, Store])],
  controllers: [NeighborhoodController],
  providers: [NeighborhoodService],
})
export class NeighborhoodModule {}
