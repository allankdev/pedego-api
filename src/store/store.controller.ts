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
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Criar uma nova loja
  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    try {
      return await this.storeService.create(createStoreDto);
    } catch (error) {
      throw new BadRequestException(`Erro ao criar a loja: ${error.message}`);
    }
  }

  // Buscar loja pelo subdomínio
  @Get(':subdomain')
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

  // Atualizar informações de uma loja
  @Put(':subdomain')
  async updateStore(
    @Param('subdomain') subdomain: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    try {
      return await this.storeService.update(subdomain, updateStoreDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Loja '${subdomain}' não encontrada para atualização`,
        );
      }
      throw error;
    }
  }

  // Remover uma loja
  @Delete(':subdomain')
  async deleteStore(@Param('subdomain') subdomain: string) {
    try {
      await this.storeService.remove(subdomain);
      return { message: `Loja '${subdomain}' removida com sucesso` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          `Loja '${subdomain}' não encontrada para remoção`,
        );
      }
      throw error;
    }
  }
}
