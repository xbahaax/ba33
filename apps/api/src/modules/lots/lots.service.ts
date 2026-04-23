import { Injectable } from '@nestjs/common';
import { UlotsRepository } from './lots.repository';

@Injectable()
export class UlotsService {
  constructor(private readonly lotsRepository: UlotsRepository) {}
}
