import { Injectable } from '@nestjs/common';
import { LaverieRepository } from './laverie.repository';

@Injectable()
export class LaverieService {
  constructor(private readonly laverieRepository: LaverieRepository) {}

  getOverview() {
    return this.laverieRepository.getOverview();
  }
}
