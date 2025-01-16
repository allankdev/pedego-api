import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { Evaluation } from './evaluation.entity';

@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  async createEvaluation(
    @Body() body: { restaurantId: number; deliveryId: number; rating: number; comment: string },
  ): Promise<Evaluation> {
    const { restaurantId, deliveryId, rating, comment } = body;
    return this.evaluationService.createEvaluation(restaurantId, deliveryId, rating, comment);
  }

  @Get(':restaurantId')
  async getEvaluations(@Param('restaurantId') restaurantId: number): Promise<Evaluation[]> {
    return this.evaluationService.getEvaluations(restaurantId);
  }
}
