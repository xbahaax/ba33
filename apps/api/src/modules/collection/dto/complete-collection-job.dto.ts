import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompleteCollectionJobDto {
  @ApiProperty({ description: 'Actual measured weight in kg' })
  @IsNumberString()
  actualWeightKg: string;

  @ApiPropertyOptional({
    description: 'Quick state assessment of the wool',
    enum: ['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat'],
  })
  @IsOptional()
  @IsIn(['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat'])
  stateQuick?: 'clean' | 'dirty' | 'very_dirty' | 'contaminated' | 'with_meat';

  @ApiPropertyOptional({ description: 'Cold-chain temperature in °C (C2 only)' })
  @IsOptional()
  @IsNumberString()
  coldChainTempC?: string;

  @ApiPropertyOptional({ description: 'GPS latitude at arrival' })
  @IsOptional()
  @IsNumberString()
  gpsLat?: string;

  @ApiPropertyOptional({ description: 'GPS longitude at arrival' })
  @IsOptional()
  @IsNumberString()
  gpsLng?: string;

  @ApiPropertyOptional({ description: 'Free-form arrival notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'QR code printed/scanned at arrival' })
  @IsOptional()
  @IsString()
  qrCode?: string;

  @ApiPropertyOptional({ description: 'Override urgency for the resulting lot' })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
