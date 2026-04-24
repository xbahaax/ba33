import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsNumberString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InitialWeighDto {
  @ApiProperty()
  @IsNumberString()
  weightKg: string;

  @ApiPropertyOptional({ enum: ['scale_bluetooth', 'manual', 'estimated'] })
  @IsOptional()
  @IsEnum(['scale_bluetooth', 'manual', 'estimated'])
  source?: 'scale_bluetooth' | 'manual' | 'estimated';
}

export class CreateLotDto {
  @ApiProperty()
  @IsUUID()
  sourceId: string;

  @ApiPropertyOptional({ enum: ['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator'] })
  @IsOptional()
  @IsEnum(['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator'])
  sourceType?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  collectorId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  qrCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  declaredWeightKg?: string;

  @ApiPropertyOptional({ enum: ['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat'] })
  @IsOptional()
  @IsEnum(['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat'])
  stateQuick?: 'clean' | 'dirty' | 'very_dirty' | 'contaminated' | 'with_meat';

  @ApiPropertyOptional({ enum: ['normal', 'urgent'] })
  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  urgency?: 'normal' | 'urgent';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  coldChainTempC?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  gpsLat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  gpsLng?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  preLotId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  routeStopId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  voiceNoteId?: string;

  @ApiPropertyOptional({ type: InitialWeighDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InitialWeighDto)
  initialWeigh?: InitialWeighDto;
}
