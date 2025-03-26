import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    UseGuards,
    Req,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { CouponService } from './coupon.service';
  import { CreateCouponDto } from './dto/create-coupon.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { Roles } from '../auth/roles.decorator';
  import { RolesGuard } from '../auth/roles.guard';
  import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
  } from '@nestjs/swagger';
  import { Coupon } from './coupon.entity';
  
  @ApiTags('Coupons')
  @ApiBearerAuth('access-token')
  @Controller('coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class CouponController {
    constructor(private readonly couponService: CouponService) {}
  
    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Cria um novo cupom (apenas ADMIN)' })
    @ApiBody({ type: CreateCouponDto })
    @ApiResponse({ status: 201, description: 'Cupom criado com sucesso', type: Coupon })
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async create(@Body() dto: CreateCouponDto, @Req() req: any): Promise<Coupon> {
      return this.couponService.create(dto, req.user);
    }
  
    @Get('validate')
    @ApiOperation({ summary: 'Valida um cupom por código (público)' })
    @ApiQuery({ name: 'code', type: String, required: true, description: 'Código do cupom' })
    @ApiResponse({
      status: 200,
      description: 'Validação do cupom retornada com sucesso',
      schema: {
        example: {
          code: 'DESCONTO10',
          discountPercentage: 10,
          valid: true,
          expiresAt: '2025-04-30T23:59:59.000Z',
        },
      },
    })
    async validate(@Query('code') code: string) {
      return this.couponService.validate(code);
    }
  }
  