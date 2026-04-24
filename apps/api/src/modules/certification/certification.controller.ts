import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificationService } from './certification.service';

@ApiTags('certification')
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get('verify/:code')
  @ApiOperation({ summary: 'Public certificate verification by code' })
  async verify(@Param('code') code: string) {
    return { verified: false, message: 'Certificate verification coming soon' };
  }
}
