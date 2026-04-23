import { Injectable } from '@nestjs/common';
import { UnotificationsRepository } from './notifications.repository';

@Injectable()
export class UnotificationsService {
  constructor(private readonly notificationsRepository: UnotificationsRepository) {}
}
