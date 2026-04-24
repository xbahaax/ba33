import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiQuery({ name: 'subjectType', required: false })
  @ApiQuery({ name: 'auditorId', required: false })
  async listAudits(
    @Query('subjectType') subjectType?: string,
    @Query('auditorId') auditorId?: string,
  ) {
    return this.auditService.listAudits({ subjectType, auditorId });
  }

  @Get(':subjectType/:subjectId')
  async getSubjectAudits(
    @Param('subjectType') subjectType: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.auditService.getSubjectAudits(subjectType, subjectId);
  }
}
