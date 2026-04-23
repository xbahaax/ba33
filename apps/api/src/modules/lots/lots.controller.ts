import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UlotsService } from './lots.service';

@ApiTags('lots')
@Controller('lots')
export class UlotsController {
  constructor(private readonly lotsService: UlotsService) {}
}
