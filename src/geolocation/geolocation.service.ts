import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geolocation } from './geolocation.entity';

@Injectable()
export class GeolocationService {
  constructor(
    @InjectRepository(Geolocation)
    private readonly geolocationRepository: Repository<Geolocation>,
  ) {}

  async getGeolocation(userId: number): Promise<Geolocation> {
    return this.geolocationRepository.findOne({ where: { userId } });
  }

  async updateGeolocation(userId: number, latitude: number, longitude: number): Promise<void> {
    const geolocation = await this.getGeolocation(userId);
    if (geolocation) {
      geolocation.latitude = latitude;
      geolocation.longitude = longitude;
      await this.geolocationRepository.save(geolocation);
    } else {
      await this.geolocationRepository.save({ userId, latitude, longitude });
    }
  }
}