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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post(':storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiParam({ name: 'storeId', type: Number })
  create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateCategoryDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.categoryService.create(storeId, dto, user);
  }

  @Get('my-store')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar categorias da loja do admin autenticado' })
  findMine(@Req() req: Request) {
    const user = req.user as any;
    const storeId = Number(user.store?.id);
    return this.categoryService.findAllForAuthenticated(storeId, user);
  }

  @Get(':storeId')
  @Public()
  @ApiOperation({ summary: 'Listar categorias da loja (público)' })
  @ApiParam({ name: 'storeId', type: Number })
  findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.categoryService.findAll(storeId);
  }

  @Put('reorder/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Reordenar categorias da loja' })
  @ApiParam({ name: 'storeId', type: Number })
  @ApiBody({
    schema: {
      example: [
        { id: 1, position: 0 },
        { id: 3, position: 1 },
      ],
    },
  })
  reorder(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: { id: number; position: number }[],
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.categoryService.reorder(storeId, dto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.categoryService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remover categoria' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.categoryService.remove(id, user);
  }

  @Get('with-products/:storeId')
@Public()
@ApiOperation({ summary: 'Listar categorias com produtos da loja (público)' })
@ApiParam({ name: 'storeId', type: Number })
async findWithProducts(@Param('storeId', ParseIntPipe) storeId: number) {
  return this.categoryService.findWithProducts(storeId)
}
}
