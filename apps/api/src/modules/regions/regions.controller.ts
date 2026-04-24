import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { RegionsService } from './regions.service';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'List regions with optional type filter' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['wilaya', 'commune', 'village'],
    description: 'Filter by region type',
  })
  async listRegions(
    @Query('type') type?: 'wilaya' | 'commune' | 'village',
  ) {
    return this.regionsService.listRegions(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  async getRegion(@Param('id', ParseUUIDPipe) id: string) {
    return this.regionsService.getRegion(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get sub-regions of a region' })
  async getSubRegions(@Param('id', ParseUUIDPipe) id: string) {
    return this.regionsService.getSubRegions(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed all 58 Algerian wilayas (admin only)' })
  async seedWilayas() {
    return this.regionsService.seedWilayas();
  }
}
