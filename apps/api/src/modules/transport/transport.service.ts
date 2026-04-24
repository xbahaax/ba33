import { Injectable } from '@nestjs/common';
import { TransportRepository } from './transport.repository';

@Injectable()
export class TransportService {
  constructor(private readonly transportRepository: TransportRepository) {}

  getOverview() {
    return this.transportRepository.getOverview();
  }
}
