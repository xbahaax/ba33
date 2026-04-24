import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Seed the database with test data (dev only)' })
  async seed() {
    try {
      return await this.seedService.seed();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('duplicate key') || message.includes('unique constraint')) {
        return { message: 'Database already seeded. Use a fresh database or reset before re-seeding.' };
      }
      throw error;
    }
  }
}
