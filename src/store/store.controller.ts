import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../user/enums/user-role.enum';
import { Public } from '../auth/public.decorator';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria uma nova loja (Apenas ADMIN)' })
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
  @Public()
  @ApiOperation({ summary: 'Busca loja pelo subdomínio (público)' })
  @ApiParam({ name: 'subdomain', type: String })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualiza informações de uma loja (Apenas ADMIN)' })
  @ApiParam({ name: 'subdomain', type: String })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({ status: 200, description: 'Loja atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada para atualização' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateStore(
    @Param('subdomain') subdomain: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (!user.store || user.store.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    return await this.storeService.update(subdomain, updateStoreDto, user);
  }

  @Patch(':subdomain/avatar')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualiza apenas o avatar da loja' })
  @ApiParam({ name: 'subdomain', type: String })
  async updateAvatar(
    @Param('subdomain') subdomain: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user;

    if (!user.store || user.store.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada');
    }

    return await this.storeService.updateAvatar(subdomain, user, file);
  }

  @Patch(':subdomain/cover')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualiza apenas a capa da loja' })
  @ApiParam({ name: 'subdomain', type: String })
  async updateCover(
    @Param('subdomain') subdomain: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user;

    if (!user.store || user.store.subdomain !== subdomain) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta loja.');
    }

    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada');
    }

    return await this.storeService.updateCover(subdomain, user, file);
  }

  @Patch(':subdomain/toggle-open')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Altera status da loja manualmente ou volta para modo automático' })
  @ApiParam({ name: 'subdomain', type: String })
  @ApiQuery({ name: 'auto', required: false, type: Boolean })
  async toggleStoreStatus(
    @Param('subdomain') subdomain: string,
    @Query('auto') auto: boolean, // Alterado para boolean
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return await this.storeService.toggleOpen(subdomain, user, auto);
  }

  @Delete(':subdomain')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove uma loja pelo subdomínio (Apenas ADMIN)' })
  @ApiParam({ name: 'subdomain', type: String })
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
