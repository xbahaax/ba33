import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsNumberString } from 'class-validator';

export class UpdateSourceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: ['pending', 'active', 'suspended'] })
  @IsOptional()
  @IsEnum(['pending', 'active', 'suspended'])
  status?: 'pending' | 'active' | 'suspended';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
