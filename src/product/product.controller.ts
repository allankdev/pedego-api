import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    type: Product,
    isArray: true,
  })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um produto específico pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: Product })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo produto' })
  @ApiBody({ type: CreateProductDto })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    try {
      return this.productService.create(createProductDto);
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
  @ApiOperation({ summary: 'Atualiza um produto' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiBody({ type: UpdateProductDto }) // Exibe os campos do UpdateProductDto no Swagger
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      return this.productService.update(id, updateProductDto);
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
  @ApiOperation({ summary: 'Remove um produto' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return this.productService.remove(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao remover produto',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
