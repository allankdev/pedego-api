import {
    Controller,
    Get,
    Patch,
    UseGuards,
    Param,
    ParseIntPipe,
    Req,
    Body,
    Put,
    Query,
    Res,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
  } from '@nestjs/swagger';
  import { SuperAdminService } from './super-admin.service';
  import { Roles } from '../auth/roles.decorator';
  import { UserRole } from '../user/enums/user-role.enum';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
  import { FilterStoresDto } from './dto/filter-stores.dto';
  import { FilterUsersDto } from './dto/filter-users.dto';
  
  @ApiTags('Super Admin')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Controller('super-admin')
  export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) {}
  
    @Get('summary')
    @ApiOperation({ summary: 'Resumo global da plataforma' })
    async getSummary() {
      return this.superAdminService.getPlatformSummary();
    }
  
    @Get('stores-overview')
    @ApiOperation({ summary: 'Visão geral das lojas' })
    async getStoresOverview() {
      return this.superAdminService.getStoresOverview();
    }
  
    @Get('subscription-payments')
    @ApiOperation({ summary: 'Pagamentos de assinatura' })
    async getSubscriptionPayments() {
      return this.superAdminService.getSubscriptionPayments();
    }
  
    @Patch('stores/:id/suspend')
    @ApiOperation({ summary: 'Suspende ou reativa uma loja' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da loja' })
    async suspendStore(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
      return this.superAdminService.suspendStore(id, req.user.sub);
    }
  
    @Patch('users/:id/toggle-active')
    @ApiOperation({ summary: 'Ativa ou desativa um usuário' })
    @ApiParam({ name: 'id', type: Number })
    async toggleUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
      return this.superAdminService.toggleUserActive(id, req.user.sub);
    }
  
    @Get('audit-logs')
    @ApiOperation({ summary: 'Lista os logs de auditoria' })
    async getAuditLogs() {
      return this.superAdminService.getAuditLogs();
    }
    @Put('stores/:storeId/upgrade-plan')
    @ApiOperation({ summary: 'Atualiza o plano da loja (por storeId)' })
    @ApiParam({ name: 'storeId', type: Number })
    async upgradeStorePlan(
      @Param('storeId', ParseIntPipe) storeId: number,
      @Body() dto: UpgradeSubscriptionDto,
      @Req() req: any,
    ) {
      return this.superAdminService.upgradeStorePlan(storeId, dto, req.user.sub);
    }
    
    @Get('stores')
    @ApiOperation({ summary: 'Filtra lojas (SUPER_ADMIN)' })
    async filterStores(@Query() filters: FilterStoresDto) {
      return this.superAdminService.filterStores(filters);
    }
  
    @Get('users')
    @ApiOperation({ summary: 'Filtra usuários (SUPER_ADMIN)' })
    async filterUsers(@Query() filters: FilterUsersDto) {
      return this.superAdminService.filterUsers(filters);
    }
  
    @Get('charts/overview')
    @ApiOperation({ summary: 'Retorna dados agregados para gráficos' })
    async getChartsOverview() {
      return this.superAdminService.getChartsOverview();
    }
  
    @Get('export/:entity')
    @ApiOperation({ summary: 'Exporta dados como CSV' })
    @ApiParam({ name: 'entity', type: String, description: 'stores | users | orders | payments' })
    async exportEntityCSV(@Param('entity') entity: string, @Res() res: any) {
      const csv = await this.superAdminService.exportCSV(entity);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${entity}.csv`);
      return res.send(csv);
    }
  }
  