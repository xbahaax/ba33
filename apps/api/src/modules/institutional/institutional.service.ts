import { Injectable } from '@nestjs/common';
import { InstitutionalRepository } from './institutional.repository';

@Injectable()
export class InstitutionalService {
  constructor(private readonly institutionalRepository: InstitutionalRepository) {}
}
