import { Injectable } from '@nestjs/common';
import { UcollectionRepository } from './collection.repository';

@Injectable()
export class UcollectionService {
  constructor(private readonly collectionRepository: UcollectionRepository) {}
}
