import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Geolocation } from './geolocation.entity';
import { GeolocationService } from './geolocation.service';
import { GeolocationController } from './geolocation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Geolocation])],
  providers: [GeolocationService],
  controllers: [GeolocationController],
})
export class GeolocationModule {}
