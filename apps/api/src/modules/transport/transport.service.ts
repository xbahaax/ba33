import { Injectable } from '@nestjs/common';
import { AdvanceTransportJobDto } from './dto/advance-transport-job.dto';
import { TransportRepository } from './transport.repository';

@Injectable()
export class TransportService {
  constructor(private readonly transportRepository: TransportRepository) {}

  getOverview() {
    return this.transportRepository.getOverview();
  }

  advanceJob(
    jobId: string,
    input: AdvanceTransportJobDto,
    actorId: string,
    actorType: string,
  ) {
    return this.transportRepository.advanceJob(jobId, input, actorId, actorType);
  }
}
