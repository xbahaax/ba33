import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RequirePermissions } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions('users.view')
  @Get('overview')
  getOverview() {
    return this.usersService.getOverview();
  }

  @RequirePermissions('users.view')
  @Get('access-overview')
  getAccessOverview() {
    return this.usersService.getAccessOverview();
  }

  @RequirePermissions('rbac.manage')
  @Patch(':userId/access')
  updateAccess(
    @Param('userId') userId: string,
    @Body() input: UpdateUserAccessDto,
  ) {
    return this.usersService.updateAccess(userId, input);
  }
}
