// src/stripe/stripe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { Request } from 'express';
import { PaymentService } from '../payment/payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  PaymentType,
  PaymentMethod,
} from '../payment/dto/create-payment.dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentService: PaymentService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
    });
  }

  /**
   * Cria uma sessão de pagamento do Stripe para uma assinatura
   */
  async createCheckoutSession(userId: number, plan: 'MONTHLY' | 'YEARLY') {
    const price = plan === 'MONTHLY' ? 4990 : 49900; // em centavos

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Assinatura ${plan === 'MONTHLY' ? 'Mensal' : 'Anual'}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId: String(userId),
        plan,
      },
      success_url: `${process.env.FRONTEND_URL}/assinatura/sucesso`,
      cancel_url: `${process.env.FRONTEND_URL}/assinatura/erro`,
    });

    return session;
  }

  /**
   * Verifica e valida o evento vindo do Stripe Webhook
   */
  verifyStripeEvent(req: Request): Stripe.Event {
    const sig = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody ?? req.body;

    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook inválido: ${err.message}`);
    }
  }

  /**
   * Lida com o evento de pagamento confirmado
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    const userId = Number(metadata?.userId);
    const plan = metadata?.plan as 'MONTHLY' | 'YEARLY';
    const amount = session.amount_total ?? 0;
    const stripeTransactionId = session.payment_intent as string;

    if (!userId || !plan) {
      throw new BadRequestException('Dados de metadata incompletos no checkout');
    }

    // ✅ Atualiza a assinatura do usuário
    await this.subscriptionService.upgradeSubscription(userId, plan);

    // ✅ Registra o pagamento no sistema
    await this.paymentService.createPayment({
      type: PaymentType.SUBSCRIPTION,
      paymentMethod: PaymentMethod.STRIPE,
      amount: amount / 100,
      userId,
      stripeTransactionId,
    });
  }
}
