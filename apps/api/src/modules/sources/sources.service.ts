import { Injectable } from '@nestjs/common';
import { UsourcesRepository } from './sources.repository';

@Injectable()
export class UsourcesService {
  constructor(private readonly sourcesRepository: UsourcesRepository) {}
}
