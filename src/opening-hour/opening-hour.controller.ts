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
  Req,
} from '@nestjs/common';
import { OpeningHourService } from './opening-hour.service';
import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/enums/user-role.enum';
import { Public } from '../auth/public.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Opening Hours')
@Controller('opening-hours')
export class OpeningHourController {
  constructor(private readonly service: OpeningHourService) {}

  @Post(':storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Criar horário de funcionamento' })
  @ApiParam({ name: 'storeId', type: Number })
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateOpeningHourDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.service.create(storeId, dto, user);
  }

  @Get(':storeId')
  @Public()
  @ApiOperation({ summary: 'Listar horários da loja (público)' })
  @ApiParam({ name: 'storeId', type: Number })
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.service.findAll(storeId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar horários da loja do usuário autenticado' })
  findMyOpeningHours(@Req() req: Request) {
    const user = req.user as any;
    const storeId = user?.store?.id;
    if (!storeId) {
      throw new Error('Loja não encontrada para o usuário');
    }
    return this.service.findAllForAuthenticated(storeId, user); // 🔥 CHAMANDO O CERTO AQUI
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualizar horário de funcionamento' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOpeningHourDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remover horário de funcionamento' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.service.remove(id, user);
  }
}
