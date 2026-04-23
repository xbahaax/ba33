import { Injectable } from '@nestjs/common';
import { UfilesRepository } from './files.repository';

@Injectable()
export class UfilesService {
  constructor(private readonly filesRepository: UfilesRepository) {}
}
