import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InstitutionalService } from './institutional.service';

@ApiTags('institutional')
@Controller('institutional')
export class InstitutionalController {
  constructor(private readonly institutionalService: InstitutionalService) {}
}
