import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumberString } from 'class-validator';

export class CreatePreLotDto {
  @ApiProperty({ description: 'Source (shepherd) ID' })
  @IsUUID()
  sourceId: string;

  @ApiProperty({ description: 'Estimated weight in kg' })
  @IsNumberString()
  estimatedWeightKg: string;

  @ApiPropertyOptional({ description: 'Estimated range descriptor' })
  @IsOptional()
  @IsString()
  estimatedRange?: string;

  @ApiPropertyOptional({ description: 'GPS latitude' })
  @IsOptional()
  @IsNumberString()
  locationLat?: string;

  @ApiPropertyOptional({ description: 'GPS longitude' })
  @IsOptional()
  @IsNumberString()
  locationLng?: string;

  @ApiPropertyOptional({ description: 'Region ID' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Voice note file ID' })
  @IsOptional()
  @IsUUID()
  voiceNoteId?: string;
}
