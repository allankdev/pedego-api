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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator'; // 👈 novo

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cria uma nova loja' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: 201, description: 'Loja criada com sucesso' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createStore(@Body() createStoreDto: CreateStoreDto) {
    try {
      return await this.storeService.create(createStoreDto);
    } catch (error) {
      throw new BadRequestException(`Erro ao criar a loja: ${error.message}`);
    }
  }

  @Get(':subdomain')
  @Public() // 👈 LIBERADO para acesso público
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
  @Roles('ADMIN')
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
  @Roles('ADMIN')
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
