import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Coupon } from './coupon.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Store } from '../store/store.entity';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,

    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(dto: CreateCouponDto, user: any): Promise<Coupon> {
    const store = await this.storeRepository.findOne({
      where: { id: user.store.id },
    });

    if (!store) throw new NotFoundException('Loja não encontrada');

    const coupon = this.couponRepository.create({
      ...dto,
      store,
    });

    return this.couponRepository.save(coupon);
  }

  async validate(code: string): Promise<any> {
    const coupon = await this.couponRepository.findOne({ where: { code } });

    if (!coupon || new Date(coupon.expiresAt) < new Date()) {
      return { valid: false };
    }

    return {
      code: coupon.code,
      discountPercentage: coupon.discount,
      valid: true,
      expiresAt: coupon.expiresAt,
    };
  }

  async findAllByStore(storeId: number): Promise<Coupon[]> {
    return this.couponRepository.find({
      where: { store: { id: storeId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateCouponDto, user: any): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id: Number(id) },
      relations: ['store'],
    });

    if (!coupon) throw new NotFoundException('Cupom não encontrado');
    if (coupon.store.id !== user.store.id) {
      throw new ForbiddenException('Você não tem permissão para editar este cupom');
    }

    Object.assign(coupon, dto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string, user: any): Promise<void> {
    const coupon = await this.couponRepository.findOne({
      where: { id: Number(id) },
      relations: ['store'],
    });

    if (!coupon) throw new NotFoundException('Cupom não encontrado');
    if (coupon.store.id !== user.store.id) {
      throw new ForbiddenException('Você não tem permissão para remover este cupom');
    }

    await this.couponRepository.remove(coupon);
  }
}
