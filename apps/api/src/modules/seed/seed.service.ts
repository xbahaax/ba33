import { ForbiddenException, Injectable } from '@nestjs/common';
import { seedDemoData } from '../../scripts/seed';
import { seedBuyerDemoData } from '../../scripts/seed-buyer';

@Injectable()
export class SeedService {
  async seed() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('The demo seed endpoint is disabled in production.');
    }

    const pipeline = await seedDemoData();
    const buyer = await seedBuyerDemoData();

    return { ...pipeline, buyer };
  }
}
