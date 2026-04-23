import { Injectable } from '@nestjs/common';
import { UinstitutionalRepository } from './institutional.repository';

@Injectable()
export class UinstitutionalService {
  constructor(private readonly institutionalRepository: UinstitutionalRepository) {}
}
