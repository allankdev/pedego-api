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
  BadRequestException,
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
import { StripeService } from '../stripe/stripe.service'
import { Public } from '../auth/public.decorator'
import { SubscriptionPlan } from './subscription.entity';


@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lista todas as assinaturas (apenas SUPER_ADMIN)' })
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll()
  }

  @Get('me')
  @ApiOperation({ summary: 'Busca a assinatura do usuário autenticado' })
  async getMySubscription(@Request() req: any): Promise<Subscription> {
    const userId = req.user.sub
    const subscription = await this.subscriptionService.findByUserId(userId)

    // Cria uma trial somente se não houver nenhuma assinatura
    if (!subscription) {
      return this.subscriptionService.createTrial(userId)
    }

    return subscription
  }

  @Get(':userId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Busca assinatura de um usuário específico (SUPER_ADMIN)' })
  @ApiParam({ name: 'userId', type: Number })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionService.findByUserId(userId)

    if (!subscription) {
      throw new NotFoundException(`Assinatura do usuário ${userId} não encontrada.`)
    }

    return subscription
  }

  @Put('check-expiration')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Expira trials vencidos (SUPER_ADMIN)' })
  async checkAndExpireSubscriptions(): Promise<{ updated: number }> {
    return this.subscriptionService.checkAndExpireSubscriptions()
  }

  @Post('upgrade')
  @Roles(UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Upgrade para plano mensal ou anual (SUPER_ADMIN)' })
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
  async upgrade(@Body() body: { userId: number; plan: 'MONTHLY' | 'YEARLY' }) {
    return this.subscriptionService.upgradeSubscription(body.userId, SubscriptionPlan[body.plan]);
  }

  @Post('checkout')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Cria sessão de pagamento Stripe para assinatura (ADMIN)' })
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
    return this.stripeService.createCheckoutSession(req.user.sub, body.plan)
  }


  @Get('stripe/session/:id')
  @Public()
  @ApiOperation({ summary: 'Consulta sessão do Stripe + assinatura (público)' })
  @ApiParam({ name: 'id', type: String })
  async getStripeSession(@Param('id') id: string) {
    const session = await this.stripeService.retrieveSession(id)

    if (!session) {
      throw new NotFoundException('Stripe session not found')
    }

    const userId = Number(session.metadata?.userId)
    if (!userId) {
      throw new BadRequestException('Invalid user ID in session metadata')
    }

    const subscription = await this.subscriptionService.findByUserId(userId)

    return { session, subscription }
  }
}
