import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geolocation } from './geolocation.entity';
import { UpdateGeolocationDto } from './dto/update-geolocation.dto';

@Injectable()
export class GeolocationService {
  constructor(
    @InjectRepository(Geolocation)
    private readonly geolocationRepository: Repository<Geolocation>,
  ) {}

  async getGeolocation(userId: number): Promise<Geolocation> {
    const geolocation = await this.geolocationRepository.findOne({ where: { userId } });

    if (!geolocation) {
      throw new NotFoundException(`Geolocalização do usuário ${userId} não encontrada.`);
    }

    return geolocation;
  }

  async updateGeolocation(userId: number, updateGeolocationDto: UpdateGeolocationDto): Promise<Geolocation> {
    const { latitude, longitude } = updateGeolocationDto;

    // 🔹 Se latitude ou longitude forem nulos, retorna erro 400
    if (latitude == null || longitude == null) {
      throw new BadRequestException('Latitude e longitude são obrigatórios.');
    }

    let geolocation = await this.geolocationRepository.findOne({ where: { userId } });

    if (!geolocation) {
      // 🔹 Se não existe, cria um novo registro em vez de retornar erro 404
      geolocation = this.geolocationRepository.create({ userId, latitude, longitude });
    } else {
      // 🔹 Se existe, atualiza os campos
      Object.assign(geolocation, { latitude, longitude });
    }

    return await this.geolocationRepository.save(geolocation);
  }
}
