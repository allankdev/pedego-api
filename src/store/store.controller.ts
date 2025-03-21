import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova loja' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: 201, description: 'Loja criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao criar a loja' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    try {
      return await this.storeService.create(createStoreDto);
    } catch (error) {
      throw new BadRequestException(`Erro ao criar a loja: ${error.message}`);
    }
  }

  @Get(':subdomain')
  @ApiOperation({ summary: 'Busca loja pelo subdomínio' })
  @ApiParam({ name: 'subdomain', type: String, description: 'Subdomínio da loja' })
  @ApiResponse({ status: 200, description: 'Loja encontrada' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada' })
  async getStore(@Param('subdomain') subdomain: string) {
    try {
      return await this.storeService.findBySubdomain(subdomain);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Loja '${subdomain}' não encontrada`);
      }
      throw error;
    }
  }

  @Put(':subdomain')
  @ApiOperation({ summary: 'Atualiza informações de uma loja' })
  @ApiParam({ name: 'subdomain', type: String, description: 'Subdomínio da loja' })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({ status: 200, description: 'Loja atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada para atualização' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateStore(
    @Param('subdomain') subdomain: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    try {
      return await this.storeService.update(subdomain, updateStoreDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Loja '${subdomain}' não encontrada para atualização`);
      }
      throw error;
    }
  }

  @Delete(':subdomain')
  @ApiOperation({ summary: 'Remove uma loja pelo subdomínio' })
  @ApiParam({ name: 'subdomain', type: String, description: 'Subdomínio da loja' })
  @ApiResponse({ status: 200, description: 'Loja removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada para remoção' })
  async deleteStore(@Param('subdomain') subdomain: string) {
    try {
      await this.storeService.remove(subdomain);
      return { message: `Loja '${subdomain}' removida com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Loja '${subdomain}' não encontrada para remoção`);
      }
      throw error;
    }
  }
}
