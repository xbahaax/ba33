import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateUserDto {
  @ApiProperty({ example: 'user@ba33.dz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ahmed Bensaid' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: '+213555123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: USER_TYPES, example: 'collector' })
  @IsIn(USER_TYPES)
  userType: (typeof USER_TYPES)[number];

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  regionId?: string;
}
