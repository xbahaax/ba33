import { Injectable } from '@nestjs/common';
import { SourcesRepository } from './sources.repository';

@Injectable()
export class SourcesService {
  constructor(private readonly sourcesRepository: SourcesRepository) {}
}
