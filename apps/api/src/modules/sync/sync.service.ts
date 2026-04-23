import { Injectable } from '@nestjs/common';
import { UsyncRepository } from './sync.repository';

@Injectable()
export class UsyncService {
  constructor(private readonly syncRepository: UsyncRepository) {}
}
