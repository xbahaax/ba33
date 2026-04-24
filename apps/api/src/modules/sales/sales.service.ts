import { Injectable } from '@nestjs/common';
import { AdvanceOrderDto } from './dto/advance-order.dto';
import { SalesRepository } from './sales.repository';

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  getOverview() {
    return this.salesRepository.getOverview();
  }

  advanceOrder(
    orderId: string,
    input: AdvanceOrderDto,
    actorId: string,
    actorType: string,
  ) {
    return this.salesRepository.advanceOrder(orderId, input, actorId, actorType);
  }
}
