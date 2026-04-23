import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UcertificationService } from './certification.service';

@ApiTags('certification')
@Controller('certification')
export class UcertificationController {
  constructor(private readonly certificationService: UcertificationService) {}
}
