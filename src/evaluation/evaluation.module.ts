import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { Evaluation } from './evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluation])],
  providers: [EvaluationService],
  controllers: [EvaluationController],
})
export class EvaluationModule {}
