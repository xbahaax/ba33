import { Injectable } from '@nestjs/common';
import { UtransformationRepository } from './transformation.repository';

@Injectable()
export class UtransformationService {
  constructor(private readonly transformationRepository: UtransformationRepository) {}
}
