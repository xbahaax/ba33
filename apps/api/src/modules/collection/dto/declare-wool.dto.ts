import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumberString,
  IsIn,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeclareWoolDto {
  @ApiPropertyOptional({
    description: 'User ID of the wool source. Defaults to authenticated user.',
  })
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
  profession?:
    | 'shepherd'
    | 'slaughterhouse'
    | 'butcher'
    | 'aggregator'
    | 'other';

  @ApiPropertyOptional({ description: 'Region ID' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Photo file ID' })
  @IsOptional()
  @IsUUID()
  photoId?: string;

  // ── New collection-stage fields (Stage 1 — Laine de tonte) ─────────────

  @ApiPropertyOptional({
    description: 'Date of shearing or wool extraction (ISO 8601 date, no time)',
    example: '2026-04-25',
  })
  @IsOptional()
  @IsDateString()
  shearingDate?: string;

  @ApiPropertyOptional({
    description: 'Animal breed (Ouled Djellal, Hamra, Rumbi, mix...)',
  })
  @IsOptional()
  @IsString()
  sheepBreed?: string;

  @ApiPropertyOptional({ description: 'Number of bags' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  bagCount?: number;

  @ApiPropertyOptional({
    description: 'Type of bag used',
    enum: ['PP', 'jute'],
  })
  @IsOptional()
  @IsIn(['PP', 'jute'])
  bagType?: 'PP' | 'jute';

  @ApiPropertyOptional({
    description: 'Date of last parasite treatment (ISO 8601 date)',
    example: '2026-03-01',
  })
  @IsOptional()
  @IsDateString()
  lastParasiteTreatmentDate?: string;
}
