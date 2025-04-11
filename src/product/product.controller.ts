import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import { ProductService } from './product.service'
import { Product } from './product.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os produtos' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada com sucesso', type: [Product] })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('my-store')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lista produtos da loja do admin autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de produtos da loja', type: [Product] })
  async findByStore(@Req() req: Request): Promise<Product[]> {
    const user = req.user as any
    return this.productService.findByStoreId(user.store?.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um produto específico pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: Product })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados para criar produto com imagem',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        available: { type: 'boolean' },
        storeId: { type: 'number' },
        categoryId: { type: 'number' },
        extraGroups: {
          type: 'string',
          description: 'Grupos de extras (formato JSON string)',
        },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Cria um novo produto (Apenas ADMIN)' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    try {
      // ✅ Parse booleanos manualmente
      body.available = body.available === 'true' || body.available === true;
      body.hasStockControl = body.hasStockControl === 'true' || body.hasStockControl === true;
  
      // ✅ Parse seguro do extraGroups se for string
      if (body.extraGroups && typeof body.extraGroups === 'string') {
        try {
          body.extraGroups = JSON.parse(body.extraGroups);
        } catch {
          throw new HttpException('Formato inválido para extraGroups', HttpStatus.BAD_REQUEST);
        }
      }
  
      return this.productService.create(body, file);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao criar produto',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Atualiza um produto (Apenas ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiBody({
    description: 'Dados para atualizar produto com imagem (opcional)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        available: { type: 'boolean' },
        storeId: { type: 'number' },
        categoryId: { type: 'number' },
        removeImage: { type: 'string', enum: ['true', 'false'] },
        extraGroups: {
          type: 'string',
          description: 'Grupos de extras (formato JSON string)',
        },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    try {
      body.available = body.available === 'true' || body.available === true;
      body.hasStockControl = body.hasStockControl === 'true' || body.hasStockControl === true;
  
      if (body.extraGroups && typeof body.extraGroups === 'string') {
        try {
          body.extraGroups = JSON.parse(body.extraGroups);
        } catch {
          throw new HttpException('Formato inválido para extraGroups', HttpStatus.BAD_REQUEST);
        }
      }
  
      // ✅ Se a imagem foi removida no frontend e não foi enviada uma nova, limpar imageId
      if (body.removeImage === 'true' && !file) {
        body.imageId = null;
      }
  
      return this.productService.update(id, body, file);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao atualizar produto',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove um produto (Apenas ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return this.productService.remove(id)
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao remover produto',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
