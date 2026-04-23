import { Injectable } from '@nestjs/common';
import { CollectionRepository } from './collection.repository';

@Injectable()
export class CollectionService {
  constructor(private readonly collectionRepository: CollectionRepository) {}
}
