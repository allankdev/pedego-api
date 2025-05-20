import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { Store } from '../store/store.entity';
import { Order } from '../order/order.entity';
import { Subscription } from '../subscription/subscription.entity';
import { Payment } from '../payment/payment.entity';
import { User } from '../user/user.entity';
import { AuditLog } from '../audit-log/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Store,
    Order,
    Subscription,
    Payment,
    User,
    AuditLog,
  ])],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
