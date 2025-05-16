import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { StripeModule } from '../stripe/stripe.module'; // necessário se StripeService usar PaymentService

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => StripeModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
