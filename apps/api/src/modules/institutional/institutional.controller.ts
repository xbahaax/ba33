import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstitutionalService } from './institutional.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';

@ApiTags('institutional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('institutional', 'central_admin')
@Controller('institutional')
export class InstitutionalController {
  constructor(private readonly institutionalService: InstitutionalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get full dashboard summary with aggregated stats' })
  async getDashboard() {
    return this.institutionalService.getDashboardSummary();
  }

  @Get('sources-by-region')
  @ApiOperation({ summary: 'Get source counts grouped by region and type' })
  async getSourcesByRegion() {
    return this.institutionalService.getSourcesByRegion();
  }

  @Get('lots-by-region')
  @ApiOperation({ summary: 'Get lot counts grouped by region and status' })
  async getLotsByRegion() {
    return this.institutionalService.getLotsByRegion();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity (lots and pre-lots)' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.institutionalService.getRecentActivity(
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
