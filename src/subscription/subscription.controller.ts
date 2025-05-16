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
  @ApiOperation({ summary: 'List all subscriptions (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, type: [Subscription] })
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll()
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, type: Subscription })
  async getMySubscription(@Request() req: any): Promise<Subscription> {
    const userId = req.user.id
    const subscription = await this.subscriptionService.findByUserId(userId)

    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found.`)
    }

    return subscription
  }

  @Get(':userId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get subscription by userId (SUPER_ADMIN only)' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, type: Subscription })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Subscription> {
    const subscription = await this.subscriptionService.findByUserId(userId)

    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found.`)
    }

    return subscription
  }

  @Put('check-expiration')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Expire outdated trial subscriptions' })
  @ApiResponse({ status: 200, description: 'Expired trials updated' })
  async checkAndExpireSubscriptions(): Promise<{ updated: number }> {
    return this.subscriptionService.checkAndExpireSubscriptions()
  }

  @Post('upgrade')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Upgrade subscription (SUPER_ADMIN)' })
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
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async upgrade(@Body() body: { userId: number; plan: 'MONTHLY' | 'YEARLY' }) {
    return this.subscriptionService.upgradeSubscription(body.userId, body.plan)
  }

  @Post('checkout')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create Stripe checkout session (ADMIN)' })
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

  @Post('purchase')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Purchase plan directly (ADMIN)' })
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
    return this.stripeService.createCheckoutSession(req.user.sub, body.plan)
  }

  @Get('stripe/session/:id')
  @Public()
  @ApiOperation({ summary: 'Get Stripe session + subscription (public)' })
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
