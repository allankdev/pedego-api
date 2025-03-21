import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { Stock } from './stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':productId/:storeId')
  @ApiOperation({ summary: 'Obter o estoque de um produto em uma loja específica' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID do produto' })
  @ApiParam({ name: 'storeId', type: Number, description: 'ID da loja (antes era restaurantId)' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o estoque do produto nessa loja',
    type: Stock,
  })
  async getStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<Stock> {
    try {
      return await this.stockService.getStock(productId, storeId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao obter estoque',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os estoques' })
  @ApiResponse({
    status: 200,
    description: 'Retorna a lista de todos os registros de estoque',
    type: Stock,
    isArray: true,
  })
  async findAll(): Promise<Stock[]> {
    return this.stockService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo registro de estoque' })
  @ApiBody({ type: CreateStockDto })
  @ApiResponse({
    status: 201,
    description: 'Estoque criado com sucesso',
    type: Stock,
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createStock(@Body() createStockDto: CreateStockDto): Promise<Stock> {
    try {
      return await this.stockService.create(createStockDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao criar estoque',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':productId/:storeId')
  @ApiOperation({ summary: 'Atualiza a quantidade de estoque de um produto em uma loja' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID do produto' })
  @ApiParam({ name: 'storeId', type: Number, description: 'ID da loja (antes era restaurantId)' })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: 200,
    description: 'Estoque atualizado com sucesso',
    type: Stock,
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    try {
      return await this.stockService.updateStock(productId, storeId, updateStockDto.quantity);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao atualizar estoque',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':productId/:storeId')
  @ApiOperation({ summary: 'Remove o estoque de um produto em uma loja' })
  @ApiParam({ name: 'productId', type: Number, description: 'ID do produto' })
  @ApiParam({ name: 'storeId', type: Number, description: 'ID da loja (antes era restaurantId)' })
  @ApiResponse({
    status: 200,
    description: 'Estoque removido com sucesso',
  })
  async removeStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<void> {
    try {
      return await this.stockService.remove(productId, storeId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Erro ao remover estoque',
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
