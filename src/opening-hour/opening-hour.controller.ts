// src/opening-hour/opening-hour.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OpeningHourService } from './opening-hour.service';
import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/enums/user-role.enum';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Opening Hours')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('opening-hours')
export class OpeningHourController {
  constructor(private readonly service: OpeningHourService) {}

  @Post(':storeId')
  @ApiOperation({ summary: 'Criar horário de funcionamento' })
  @ApiParam({ name: 'storeId', type: Number })
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateOpeningHourDto,
  ) {
    return this.service.create(storeId, dto);
  }

  @Get(':storeId')
  @ApiOperation({ summary: 'Listar horários da loja' })
  @ApiParam({ name: 'storeId', type: Number })
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar horário de funcionamento' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOpeningHourDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover horário de funcionamento' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
