import { Injectable } from '@nestjs/common';
import { CreateDepotDispatchDto } from './dto/create-depot-dispatch.dto';
import { CreateDepotReceptionDto } from './dto/create-depot-reception.dto';
import { DepotRepository } from './depot.repository';

@Injectable()
export class DepotService {
  constructor(private readonly depotRepository: DepotRepository) {}

  getOverview() {
    return this.depotRepository.getOverview();
  }

  receiveLot(input: CreateDepotReceptionDto, actorId: string, actorType: string) {
    return this.depotRepository.receiveLot(input, actorId, actorType);
  }

  dispatchLot(input: CreateDepotDispatchDto, actorId: string, actorType: string) {
    return this.depotRepository.dispatchLot(input, actorId, actorType);
  }
}
