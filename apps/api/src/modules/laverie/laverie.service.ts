import { Injectable } from '@nestjs/common';
import { CreateLaverieQualificationDto } from './dto/create-laverie-qualification.dto';
import { CreateLaverieReceptionDto } from './dto/create-laverie-reception.dto';
import { CreateWashingRunDto } from './dto/create-washing-run.dto';
import { LaverieRepository } from './laverie.repository';

@Injectable()
export class LaverieService {
  constructor(private readonly laverieRepository: LaverieRepository) {}

  getOverview() {
    return this.laverieRepository.getOverview();
  }

  receiveLot(input: CreateLaverieReceptionDto, actorId: string, actorType: string) {
    return this.laverieRepository.receiveLot(input, actorId, actorType);
  }

  startWash(input: CreateWashingRunDto, actorId: string, actorType: string) {
    return this.laverieRepository.startWash(input, actorId, actorType);
  }

  qualifyLot(input: CreateLaverieQualificationDto, actorId: string, actorType: string) {
    return this.laverieRepository.qualifyLot(input, actorId, actorType);
  }
}
