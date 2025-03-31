import { Injectable } from '@nestjs/common';
import { Coupon } from './coupon.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  // Criação de um novo cupom
  async create(dto: CreateCouponDto, user: any): Promise<Coupon> {
    const coupon = this.couponRepository.create(dto);
    return this.couponRepository.save(coupon);
  }

  // Validação de um cupom
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

  // Listar todos os cupons
  async findAll(): Promise<Coupon[]> {
    return this.couponRepository.find();
  }

  // Atualizar um cupom existente
  async update(id: string, dto: UpdateCouponDto, user: any): Promise<Coupon> {
    // Convertendo id para número
    const couponId = Number(id);

    const coupon = await this.couponRepository.findOne({
      where: { id: couponId }, // Agora estamos passando o id como número
    });

    if (!coupon) {
      throw new Error('Cupom não encontrado');
    }

    Object.assign(coupon, dto);
    return this.couponRepository.save(coupon);
  }

  // Excluir um cupom
  async remove(id: string): Promise<void> {
    // Convertendo id para número
    const couponId = Number(id);

    const coupon = await this.couponRepository.findOne({
      where: { id: couponId }, // Agora estamos passando o id como número
    });

    if (!coupon) {
      throw new Error('Cupom não encontrado');
    }

    await this.couponRepository.remove(coupon);
  }
}
