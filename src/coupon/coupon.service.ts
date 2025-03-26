// src/coupon/coupon.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './coupon.entity';
import { Repository } from 'typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { User } from '../user/user.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto, user: User) {
    const existing = await this.couponRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Código já existe');

    const coupon = this.couponRepo.create({ ...dto, createdBy: user });
    return this.couponRepo.save(coupon);
  }

  async validate(code: string) {
    const coupon = await this.couponRepo.findOne({ where: { code, active: true } });
    if (!coupon) throw new NotFoundException('Cupom inválido');

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('Cupom expirado');
    }

    return coupon;
  }
}
