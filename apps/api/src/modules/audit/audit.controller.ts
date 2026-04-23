import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UauditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
export class UauditController {
  constructor(private readonly auditService: UauditService) {}
}
