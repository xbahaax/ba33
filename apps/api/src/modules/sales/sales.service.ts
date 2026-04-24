import { Injectable } from '@nestjs/common';
import { SalesRepository } from './sales.repository';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  getOverview() {
    return this.salesRepository.getOverview();
  }
}
