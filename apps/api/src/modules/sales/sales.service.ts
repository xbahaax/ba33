import { Injectable } from '@nestjs/common';
import { UsalesRepository } from './sales.repository';

@Injectable()
export class UsalesService {
  constructor(private readonly salesRepository: UsalesRepository) {}
}
