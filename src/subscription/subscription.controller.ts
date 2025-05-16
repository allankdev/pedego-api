import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { Subscription } from './subscription.entity'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'
import { StripeService } from '../stripe/stripe.service' // novo

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService, // novo
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lista todas as assinaturas (apenas SUPER_ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de assinaturas retornada com sucesso',
    type: [Subscription],
  })
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll()
  }

  @Get('me')
  @ApiOperation({ summary: 'Busca a assinatura do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Assinatura encontrada com sucesso', type: Subscription })
  async getMySubscription(@Request() req: any): Promise<Subscription> {
    const userId = req.user.id
    const subscription = await this.subscriptionService.findByUserId(userId)

    if (!subscription) {
      throw new NotFoundException(`Assinatura do usuário ${userId} não encontrada.`)
    }

    return subscription
  }

  @Get(':userId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Busca a assinatura de um usuário específico (SUPER_ADMIN)' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Assinatura encontrada com sucesso', type: Subscription })
  @ApiResponse({ status: 404, description: 'Assinatura não encontrada' })
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionService.findByUserId(userId)

    if (!subscription) {
      throw new NotFoundException(`Assinatura do usuário ${userId} não encontrada.`)
    }

    return subscription
  }

  @Put('check-expiration')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verifica e atualiza o status de assinaturas expiradas (SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Assinaturas expiradas foram marcadas como EXPIRED' })
  async checkAndExpireSubscriptions(): Promise<{ updated: number }> {
    return this.subscriptionService.checkAndExpireSubscriptions()
  }

  @Post('upgrade')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Faz upgrade de uma assinatura para mensal ou anual (SUPER_ADMIN)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        plan: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
      },
      required: ['userId', 'plan'],
    },
  })
  @ApiResponse({ status: 200, description: 'Assinatura atualizada com sucesso' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async upgrade(@Body() body: { userId: number; plan: 'MONTHLY' | 'YEARLY' }) {
    return this.subscriptionService.upgradeSubscription(body.userId, body.plan)
  }

  @Post('checkout')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria uma sessão de pagamento Stripe para assinatura (ADMIN)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        plan: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
      },
      required: ['plan'],
    },
  })
  async checkout(@Request() req: any, @Body() body: { plan: 'MONTHLY' | 'YEARLY' }) {
    const user = req.user;
    return this.stripeService.createCheckoutSession(user.id, body.plan);
  }

  @Post('purchase')
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Compra direta de assinatura (sem trial)' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      plan: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
    },
    required: ['plan'],
  },
})
async purchase(@Request() req: any, @Body() body: { plan: 'MONTHLY' | 'YEARLY' }) {
  const user = req.user;
  return this.stripeService.createCheckoutSession(user.id, body.plan);
}
}