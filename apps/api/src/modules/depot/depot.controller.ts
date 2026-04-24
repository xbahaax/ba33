import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepotService } from './depot.service';

@ApiTags('depot')
@Controller('depot')
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Get('overview')
  getOverview() {
    return this.depotService.getOverview();
  }
}
