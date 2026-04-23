import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UregionsService } from './regions.service';

@ApiTags('regions')
@Controller('regions')
export class UregionsController {
  constructor(private readonly regionsService: UregionsService) {}
}
