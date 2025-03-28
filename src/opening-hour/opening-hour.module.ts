import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningHour } from './opening-hour.entity';
import { OpeningHourService } from './opening-hour.service';
import { OpeningHourController } from './opening-hour.controller';
import { Store } from '../store/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OpeningHour, Store])],
  controllers: [OpeningHourController],
  providers: [OpeningHourService],
})
export class OpeningHourModule {}
