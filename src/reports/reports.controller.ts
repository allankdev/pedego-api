import {
    Controller,
    Get,
    Query,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { ReportsService } from './reports.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';
  import { UserRole } from '../user/enums/user-role.enum';
  import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
  
  @ApiTags('Relatórios')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('reports')
  export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}
  
    @Get('sales-summary')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Resumo de vendas da loja autenticada' })
    getSalesSummary(
      @Request() req,
      @Query('from') from?: string,
      @Query('to') to?: string,
    ) {
      const storeId = req.user.store?.id;
      return this.reportsService.getSalesSummary(storeId, from, to);
    }
  
    @Get('top-products')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Produtos mais vendidos da loja autenticada' })
    getTopProducts(
      @Request() req,
      @Query('from') from?: string,
      @Query('to') to?: string,
    ) {
      const storeId = req.user.store?.id;
      return this.reportsService.getTopProducts(storeId, from, to);
    }

    @Get('customers-ranking')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Ranking de clientes da loja autenticada' })
getCustomersRanking(
  @Request() req,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  const storeId = req.user.store?.id;
  return this.reportsService.getCustomersRanking(storeId, from, to);
}


@Get('payments-summary')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Resumo de pagamentos da loja autenticada' })
getPaymentsSummary(
  @Request() req,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  const storeId = req.user.store?.id;
  return this.reportsService.getPaymentsSummary(storeId, from, to);
}

@Get('peak-hours')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Horários de pico da loja autenticada' })
getPeakHours(
  @Request() req,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  const storeId = req.user.store?.id;
  return this.reportsService.getPeakHours(storeId, from, to);
}

@Get('delivery-by-neighborhood')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Relatório de entregas por bairro' })
getDeliveryByNeighborhood(
  @Request() req,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  const storeId = req.user.store?.id;
  return this.reportsService.getDeliveryByNeighborhood(storeId, from, to);
}

@Get('coupons-usage')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Relatório de uso de cupons da loja autenticada' })
getCouponsUsage(
  @Request() req,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  const storeId = req.user.store?.id;
  return this.reportsService.getCouponsUsage(storeId, from, to);
}

@Get('low-stock')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Relatório de produtos com estoque baixo (fixo em 5)' })
getLowStock(@Request() req) {
  const storeId = req.user.store?.id;
  return this.reportsService.getLowStock(storeId); // sem passar threshold
}






  }
  