import { Body, Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { CurrentUser, RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { UpdateRuleDto } from './dto/update-rule.dto';

@ApiTags('rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @RequirePermissions('rules.view')
  @Get('overview')
  getOverview() {
    return this.rulesService.getOverview();
  }

  @RequirePermissions('rules.manage')
  @Patch(':ruleId')
  versionRule(
    @Param('ruleId') ruleId: string,
    @Body() input: UpdateRuleDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.rulesService.versionRule(ruleId, input, actorId);
  }
}
