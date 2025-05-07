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
} from '@nestjs/common'
import { NeighborhoodService } from './neighborhood.service'
import { CreateNeighborhoodDto } from './dto/create-neighborhood.dto'
import { UpdateNeighborhoodDto } from './dto/update-neighborhood.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { UserRole } from '../user/enums/user-role.enum'
import { Public } from '../auth/public.decorator' // IMPORTA Public para liberar
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger'
import { Request } from 'express'

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodController {
  constructor(private readonly service: NeighborhoodService) {}

  @Post(':storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Criar novo bairro' })
  @ApiParam({ name: 'storeId', type: Number })
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateNeighborhoodDto,
    @Req() req: Request
  ) {
    const user = req.user as any
    return this.service.create(storeId, dto, user)
  }

  @Get(':storeId')
  @Public() // 🔥 AQUI libera o GET para todo mundo
  @ApiOperation({ summary: 'Listar bairros da loja (público)' })
  @ApiParam({ name: 'storeId', type: Number })
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.service.findAll(storeId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualizar bairro' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNeighborhoodDto,
    @Req() req: Request
  ) {
    const user = req.user as any
    return this.service.update(id, dto, user)
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ativar ou inativar bairro' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { example: { active: true } } })
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { active: boolean },
    @Req() req: Request
  ) {
    const user = req.user as any
    return this.service.toggleActive(id, body.active, user)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remover bairro' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any
    return this.service.remove(id, user)
  }
}
