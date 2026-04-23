import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UinstitutionalService } from './institutional.service';

@ApiTags('institutional')
@Controller('institutional')
export class UinstitutionalController {
  constructor(private readonly institutionalService: UinstitutionalService) {}
}
