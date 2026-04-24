import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CertificationService } from './certification.service';

@ApiTags('certification')
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get('overview')
  getOverview() {
    return this.certificationService.getOverview();
  }
}
