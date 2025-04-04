// product-extra.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductExtraService } from './product-extra.service';
import { CreateProductExtraGroupDto } from './dto/create-product-extra-group.dto';
import { UpdateProductExtraGroupDto } from './dto/update-product-extra-group.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Extras de Produtos')
@Controller('product-extra')
export class ProductExtraController {
  constructor(private readonly productExtraService: ProductExtraService) {}

  @Post()
  @ApiOperation({ summary: 'Criar grupo de extras com opções' })
  @ApiBody({ type: CreateProductExtraGroupDto })
  @ApiResponse({ status: 201, description: 'Grupo de extras criado com sucesso' })
  async createGroup(@Body() dto: CreateProductExtraGroupDto) {
    return this.productExtraService.createGroup(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar grupo de extras' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do grupo de extras' })
  @ApiBody({ type: UpdateProductExtraGroupDto })
  @ApiResponse({ status: 200, description: 'Grupo de extras atualizado com sucesso' })
  async updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductExtraGroupDto,
  ) {
    return this.productExtraService.updateGroup(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover grupo de extras' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do grupo de extras' })
  @ApiResponse({ status: 200, description: 'Grupo de extras removido com sucesso' })
  async removeGroup(@Param('id', ParseIntPipe) id: number) {
    return this.productExtraService.removeGroup(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Listar grupos de extras de um produto' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Lista de grupos de extras do produto' })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productExtraService.findByProduct(productId);
  }
}
