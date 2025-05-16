// src/stripe/stripe.controller.ts
import {
    Controller,
    Post,
    Req,
    Res,
    HttpCode,
    HttpStatus,
    BadRequestException,
  } from '@nestjs/common';
  import { StripeService } from './stripe.service';
  import { Request, Response } from 'express';
  
  @Controller('webhook')
  export class StripeController {
    constructor(private readonly stripeService: StripeService) {}
  
    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
      try {
        const event = this.stripeService.verifyStripeEvent(req);
  
        if (event.type === 'checkout.session.completed') {
          await this.stripeService.handleCheckoutCompleted(event.data.object as any);
        }
  
        return res.json({ received: true });
      } catch (err) {
        console.error('Erro no webhook Stripe:', err);
        throw new BadRequestException('Webhook inválido');
      }
    }
  }
  