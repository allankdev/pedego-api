import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentService } from '../payment/payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  PaymentType,
  PaymentMethod,
} from '../payment/payment.entity'; 
import { SubscriptionPlan } from '../subscription/subscription.entity';


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
              name: `Subscription ${plan === 'MONTHLY' ? 'Monthly' : 'Yearly'}`,
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
      success_url: `${process.env.FRONTEND_URL}/signature/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/signature/error`,
    });
  
    // ✅ Retorna a URL esperada pelo frontend
    return {
      url: session.url,
      sessionId: session.id,
    };
  }
  

  /**
   * Verifica e valida o evento vindo do Stripe Webhook
   */
  verifyStripeEvent(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(`Invalid webhook: ${err.message}`);
    }
  }
  async retrieveSession(sessionId: string) {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId)
    } catch (error) {
      console.error('❌ Failed to retrieve Stripe session:', error)
      return null
    }
  }
  

  /**
   * Lida com o evento de pagamento confirmado
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;

    if (!metadata) {
      console.warn('⚠️ Missing metadata on session:', session.id);
      throw new BadRequestException('Session missing metadata');
    }

    const userIdRaw = metadata.userId;
    const planRaw = metadata.plan;

    if (!userIdRaw || !planRaw) {
      console.warn('⚠️ Incomplete metadata:', { userIdRaw, planRaw });
      throw new BadRequestException('Incomplete metadata in checkout');
    }

    const userId = Number(userIdRaw);
    const plan = planRaw as 'MONTHLY' | 'YEARLY';

    if (!Number.isInteger(userId) || userId <= 0) {
      console.warn('⚠️ Invalid userId in metadata:', userIdRaw);
      throw new BadRequestException('Invalid user ID in metadata');
    }

    const amount = session.amount_total ?? 0;
    const stripeTransactionId = session.payment_intent as string;

    // ✅ Atualiza assinatura
    await this.subscriptionService.upgradeSubscription(userId, SubscriptionPlan[plan]);

    // ✅ Registra pagamento
    await this.paymentService.createPayment({
      type: PaymentType.SUBSCRIPTION,
      paymentMethod: PaymentMethod.STRIPE,
      amount: amount / 100,
      userId,
      stripeTransactionId,
    });
  }
}
