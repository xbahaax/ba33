import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumberString } from 'class-validator';

export class DeclareWoolDto {
  @ApiProperty({ description: 'User ID of the shepherd' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Estimated weight in kg' })
  @IsNumberString()
  estimatedWeightKg: string;

  @ApiPropertyOptional({ description: 'GPS latitude' })
  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @ApiPropertyOptional({ description: 'GPS longitude' })
  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @ApiPropertyOptional({ description: 'Free-form notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Shepherd surnom (nickname)' })
  @IsOptional()
  @IsString()
  surnom?: string;

  @ApiPropertyOptional({ description: 'Farm name (mazraa)' })
  @IsOptional()
  @IsString()
  mazraa?: string;

  @ApiPropertyOptional({ description: 'Region ID' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Photo file ID' })
  @IsOptional()
  @IsUUID()
  photoId?: string;
}
