import { Controller, Get, Param, Put, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { Geolocation } from './geolocation.entity';
import { UpdateGeolocationDto } from './dto/update-geolocation.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Geolocation') // 🔹 Organiza no Swagger
@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obter a geolocalização de um usuário' })
  async getGeolocation(@Param('userId', ParseIntPipe) userId: number): Promise<Geolocation> {
    const geolocation = await this.geolocationService.getGeolocation(userId);
    if (!geolocation) {
      throw new NotFoundException(`Geolocalização do usuário ${userId} não encontrada.`);
    }
    return geolocation;
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Atualizar a geolocalização de um usuário' })
  @ApiBody({ type: UpdateGeolocationDto }) // 🔹 Exibe o body no Swagger
  async updateGeolocation(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateGeolocationDto: UpdateGeolocationDto,
  ): Promise<void> {
    await this.geolocationService.updateGeolocation(userId, updateGeolocationDto);
  }
}
