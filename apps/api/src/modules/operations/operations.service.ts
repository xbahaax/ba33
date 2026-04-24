import { Injectable } from '@nestjs/common';
import { OperationsRepository } from './operations.repository';

@Injectable()
export class OperationsService {
  constructor(private readonly operationsRepository: OperationsRepository) {}

  getCommandCenter() {
    return this.operationsRepository.getCommandCenter();
  }

  getFulfillmentOverview() {
    return this.operationsRepository.getFulfillmentOverview();
  }

  getValidationOverview() {
    return this.operationsRepository.getValidationOverview();
  }

  lookupTraceability(lookupKey: string) {
    return this.operationsRepository.lookupTraceability(lookupKey);
  }

  updateA1AlertStatus(alertId: string, status: 'open' | 'acknowledged' | 'resolved') {
    return this.operationsRepository.updateA1AlertStatus(alertId, status);
  }
}
