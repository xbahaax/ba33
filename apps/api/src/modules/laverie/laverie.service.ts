import { Injectable } from '@nestjs/common';
import { UlaverieRepository } from './laverie.repository';

@Injectable()
export class UlaverieService {
  constructor(private readonly laverieRepository: UlaverieRepository) {}
}
