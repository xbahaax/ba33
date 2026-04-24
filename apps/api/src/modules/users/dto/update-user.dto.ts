import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsUUID } from 'class-validator';

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

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@ba33.dz' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newPassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'Ahmed Bensaid' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+213555123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: USER_TYPES, example: 'collector' })
  @IsOptional()
  @IsIn(USER_TYPES)
  userType?: (typeof USER_TYPES)[number];

  @ApiPropertyOptional({ enum: USER_STATUSES, example: 'active' })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: (typeof USER_STATUSES)[number];

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  regionId?: string;
}
