// src/stripe/stripe.controller.ts
import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('webhook')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      // ✅ Usa o rawBody (Buffer) salvo via bodyParser.verify no main.ts
      const event = this.stripeService.verifyStripeEvent(
        (req as any).rawBody,
        signature,
      );

      if (event.type === 'checkout.session.completed') {
        await this.stripeService.handleCheckoutCompleted(event.data.object);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error('Erro no webhook Stripe:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
