import { Injectable } from '@nestjs/common';
import { UeventsRepository } from './events.repository';

@Injectable()
export class UeventsService {
  constructor(private readonly eventsRepository: UeventsRepository) {}
}
