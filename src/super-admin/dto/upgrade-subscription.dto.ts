import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from '../../subscription/subscription.entity';

export class UpgradeSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}
