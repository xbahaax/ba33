import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';

@ApiTags('rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('central_admin', 'regional_manager')
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active rules' })
  async listRules() {
    return this.rulesService.listRules();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a specific rule by key' })
  async getRule(@Param('key') key: string) {
    return this.rulesService.getRule(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update a rule value (admin only)' })
  async updateRule(
    @Param('key') key: string,
    @Body() body: { value: unknown; description?: string; userId?: string },
  ) {
    return this.rulesService.setRule(key, body.value, body.description, body.userId);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default rules' })
  async seedDefaults() {
    return this.rulesService.seedDefaults();
  }
}
