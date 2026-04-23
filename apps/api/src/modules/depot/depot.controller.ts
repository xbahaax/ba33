import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UdepotService } from './depot.service';

@ApiTags('depot')
@Controller('depot')
export class UdepotController {
  constructor(private readonly depotService: UdepotService) {}
}
