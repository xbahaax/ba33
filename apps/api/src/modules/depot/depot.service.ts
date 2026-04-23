import { Injectable } from '@nestjs/common';
import { DepotRepository } from './depot.repository';

@Injectable()
export class DepotService {
  constructor(private readonly depotRepository: DepotRepository) {}
}
