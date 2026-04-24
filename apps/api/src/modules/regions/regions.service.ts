import { Injectable } from '@nestjs/common';
import { RegionsRepository } from './regions.repository';

@Injectable()
export class RegionsService {
  constructor(private readonly regionsRepository: RegionsRepository) {}

  getOverview() {
    return this.regionsRepository.getOverview();
  }
}
