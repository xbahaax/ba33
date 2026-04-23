import { Injectable } from '@nestjs/common';
import { UregionsRepository } from './regions.repository';

@Injectable()
export class UregionsService {
  constructor(private readonly regionsRepository: UregionsRepository) {}
}
