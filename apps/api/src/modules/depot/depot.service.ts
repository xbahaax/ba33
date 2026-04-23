import { Injectable } from '@nestjs/common';
import { UdepotRepository } from './depot.repository';

@Injectable()
export class UdepotService {
  constructor(private readonly depotRepository: UdepotRepository) {}
}
