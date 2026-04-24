import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CertificationService } from './certification.service';

@ApiTags('certification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get('verify/qr/:qrHash')
  verifyByQr(@Param('qrHash') qrHash: string) {
    return this.certificationService.verifyByQrHash(qrHash);
  }

  @Get('verify/:code')
  verifyByCode(@Param('code') code: string) {
    return this.certificationService.verifyByCode(code);
  }
}
