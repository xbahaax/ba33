import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UrulesService } from './rules.service';

@ApiTags('rules')
@Controller('rules')
export class UrulesController {
  constructor(private readonly rulesService: UrulesService) {}
}
