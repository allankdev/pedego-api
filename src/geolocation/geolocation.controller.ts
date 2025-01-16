import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { Geolocation } from './geolocation.entity';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  // Endpoint para obter a geolocalização de um usuário
  @Get(':userId')
  async getGeolocation(@Param('userId') userId: number): Promise<Geolocation> {
    return this.geolocationService.getGeolocation(userId);
  }

  // Endpoint para atualizar a geolocalização de um usuário
  @Put(':userId')
  async updateGeolocation(
    @Param('userId') userId: number,
    @Body() { latitude, longitude }: { latitude: number; longitude: number },
  ): Promise<void> {
    await this.geolocationService.updateGeolocation(userId, latitude, longitude);
  }
}
