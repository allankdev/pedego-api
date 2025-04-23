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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger'
import { Request } from 'express'

@ApiTags('Neighborhoods')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('neighborhoods')
export class NeighborhoodController {
  constructor(private readonly service: NeighborhoodService) {}

  @Post(':storeId')
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
  @ApiOperation({ summary: 'Listar bairros da loja' })
  @ApiParam({ name: 'storeId', type: Number })
  findAll(@Param('storeId', ParseIntPipe) storeId: number, @Req() req: Request) {
    const user = req.user as any
    return this.service.findAll(storeId, user)
  }

  @Put(':id')
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
  @ApiOperation({ summary: 'Remover bairro' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any
    return this.service.remove(id, user)
  }

  
}
