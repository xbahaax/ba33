import { Injectable } from '@nestjs/common';
import { UrulesRepository } from './rules.repository';

@Injectable()
export class UrulesService {
  constructor(private readonly rulesRepository: UrulesRepository) {}
}
