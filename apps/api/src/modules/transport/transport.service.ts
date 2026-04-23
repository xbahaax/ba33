import { Injectable } from '@nestjs/common';
import { UtransportRepository } from './transport.repository';

@Injectable()
export class UtransportService {
  constructor(private readonly transportRepository: UtransportRepository) {}
}
