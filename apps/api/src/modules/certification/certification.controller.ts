import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { IssueCertificationDto } from './dto/issue-certification.dto';
import { RevokeCertificationDto } from './dto/revoke-certification.dto';
import { CertificationService } from './certification.service';

@ApiTags('certification')
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('certification.view')
  @Get('overview')
  getOverview() {
    return this.certificationService.getOverview();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('certification.manage')
  @Post(':certificationId/issue')
  issue(
    @Param('certificationId') certificationId: string,
    @Body() input: IssueCertificationDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.certificationService.issue(
      certificationId,
      input,
      actorId,
      actorType,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('certification.manage')
  @Post(':certificationId/revoke')
  revoke(
    @Param('certificationId') certificationId: string,
    @Body() input: RevokeCertificationDto,
    @CurrentUser('id') actorId: string,
    @CurrentUser('userType') actorType: string,
  ) {
    return this.certificationService.revoke(
      certificationId,
      input,
      actorId,
      actorType,
    );
  }

  @Get('verify/qr/:qrHash')
  verifyByQr(@Param('qrHash') qrHash: string) {
    return this.certificationService.verifyByQrHash(qrHash);
  }

  @Get('verify/:code')
  verifyByCode(@Param('code') code: string) {
    return this.certificationService.verifyByCode(code);
  }
}
