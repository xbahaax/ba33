import { Injectable } from '@nestjs/common';
import { LotsRepository } from './lots.repository';

@Injectable()
export class LotsService {
  constructor(private readonly lotsRepository: LotsRepository) {}

  getSummary() {
    return this.lotsRepository.getSummary();
  }
}
