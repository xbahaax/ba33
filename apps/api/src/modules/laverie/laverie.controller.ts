import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UlaverieService } from './laverie.service';

@ApiTags('laverie')
@Controller('laverie')
export class UlaverieController {
  constructor(private readonly laverieService: UlaverieService) {}
}
