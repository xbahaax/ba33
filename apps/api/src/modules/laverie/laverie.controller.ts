import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LaverieService } from './laverie.service';

@ApiTags('laverie')
@Controller('laverie')
export class LaverieController {
  constructor(private readonly laverieService: LaverieService) {}
}
