import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

const USER_TYPES = [
  'collector',
  'depot_manager',
  'laverie_operator',
  'transformer_operator',
  'sales_agent',
  'central_admin',
  'regional_manager',
  'buyer',
  'institutional',
  'system',
] as const;

const USER_STATUSES = ['active', 'suspended', 'deleted'] as const;

export class ListUsersQueryDto {
  @ApiPropertyOptional({ enum: USER_TYPES })
  @IsOptional()
  @IsIn(USER_TYPES)
  userType?: (typeof USER_TYPES)[number];

  @ApiPropertyOptional({ enum: USER_STATUSES })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: (typeof USER_STATUSES)[number];
}
