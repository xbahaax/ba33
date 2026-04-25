import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNumberString } from 'class-validator';

export class DeclareWoolOnBehalfDto {
  @ApiProperty({ description: 'Farmer name' })
  @IsString()
  farmerName: string;

  @ApiPropertyOptional({ description: 'Farmer phone' })
  @IsOptional()
  @IsString()
  farmerPhone?: string;

  @ApiProperty({ description: 'Estimated weight in kg' })
  @IsNumberString()
  estimatedWeightKg: string;

  @ApiPropertyOptional({ description: 'Weight range descriptor (e.g. "2-3", "10-20")' })
  @IsOptional()
  @IsString()
  estimatedRange?: string;

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
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  surnom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mazraa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Photo file ID' })
  @IsOptional()
  @IsUUID()
  photoId?: string;

  @ApiPropertyOptional({ description: 'ID of the transporter/collector making the declaration. Defaults to authenticated user.' })
  @IsOptional()
  @IsUUID()
  declaringUserId?: string;
}
