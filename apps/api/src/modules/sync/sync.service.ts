import { Injectable } from '@nestjs/common';
import { SyncRepository } from './sync.repository';

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}
}
