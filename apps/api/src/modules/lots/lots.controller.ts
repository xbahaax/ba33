import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LotsService } from './lots.service';

@ApiTags('lots')
@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}
}
