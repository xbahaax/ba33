import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumberString, IsIn } from 'class-validator';

export class DeclareWoolDto {
  @ApiPropertyOptional({ description: 'User ID of the wool source. Defaults to authenticated user.' })
  @IsOptional()
  @IsUUID()
  userId?: string;

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

  @ApiPropertyOptional({ description: 'Source nickname / personal name' })
  @IsOptional()
  @IsString()
  surnom?: string;

  @ApiPropertyOptional({ description: 'Address / farm / shop name' })
  @IsOptional()
  @IsString()
  mazraa?: string;

  @ApiPropertyOptional({
    description: 'Profession of the wool source',
    enum: ['shepherd', 'slaughterhouse', 'butcher', 'aggregator', 'other'],
  })
  @IsOptional()
  @IsIn(['shepherd', 'slaughterhouse', 'butcher', 'aggregator', 'other'])
  profession?: 'shepherd' | 'slaughterhouse' | 'butcher' | 'aggregator' | 'other';

  @ApiPropertyOptional({ description: 'Region ID' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Photo file ID' })
  @IsOptional()
  @IsUUID()
  photoId?: string;
}
