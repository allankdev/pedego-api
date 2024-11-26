import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './evaluation.entity';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {}

  async createEvaluation(restaurantId: number, deliveryId: number, rating: number, comment: string): Promise<Evaluation> {
    return this.evaluationRepository.save({ restaurantId, deliveryId, rating, comment });
  }

  async getEvaluations(restaurantId: number): Promise<Evaluation[]> {
    return this.evaluationRepository.find({ where: { restaurantId } });
  }
}