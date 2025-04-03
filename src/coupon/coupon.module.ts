import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './coupon.entity';
import { Store } from '../store/store.entity'; // importar a entidade Store
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, Store])], // incluir Store aqui
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
