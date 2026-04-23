import { Injectable } from '@nestjs/common';
import { TransformationRepository } from './transformation.repository';

@Injectable()
export class TransformationService {
  constructor(private readonly transformationRepository: TransformationRepository) {}
}
