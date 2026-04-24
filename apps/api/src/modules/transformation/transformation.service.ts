import { Injectable } from '@nestjs/common';
import { CompleteProductionRunDto } from './dto/complete-production-run.dto';
import { CreateProductionRunDto } from './dto/create-production-run.dto';
import { TransformationRepository } from './transformation.repository';

@Injectable()
export class TransformationService {
  constructor(private readonly transformationRepository: TransformationRepository) {}

  getOverview() {
    return this.transformationRepository.getOverview();
  }

  startProductionRun(
    input: CreateProductionRunDto,
    actorId: string,
    actorType: string,
  ) {
    return this.transformationRepository.startProductionRun(input, actorId, actorType);
  }

  completeProductionRun(
    runId: string,
    input: CompleteProductionRunDto,
    actorId: string,
    actorType: string,
  ) {
    return this.transformationRepository.completeProductionRun(
      runId,
      input,
      actorId,
      actorType,
    );
  }
}
