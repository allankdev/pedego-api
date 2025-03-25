import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { Geolocation } from './geolocation.entity';
import { UpdateGeolocationDto } from './dto/update-geolocation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Geolocation')
@ApiBearerAuth('access-token')
@Controller('geolocation')
@UseGuards(JwtAuthGuard)
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obter a geolocalização de um usuário' })
  @ApiResponse({ status: 200, description: 'Geolocalização encontrada', type: Geolocation })
  @ApiResponse({ status: 404, description: 'Geolocalização não encontrada' })
  async getGeolocation(@Param('userId', ParseIntPipe) userId: number): Promise<Geolocation> {
    const geolocation = await this.geolocationService.getGeolocation(userId);
    if (!geolocation) {
      throw new NotFoundException(`Geolocalização do usuário ${userId} não encontrada.`);
    }
    return geolocation;
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Atualizar a geolocalização de um usuário' })
  @ApiBody({ type: UpdateGeolocationDto })
  @ApiResponse({ status: 200, description: 'Geolocalização atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateGeolocation(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateGeolocationDto: UpdateGeolocationDto,
  ): Promise<void> {
    await this.geolocationService.updateGeolocation(userId, updateGeolocationDto);
  }
}
