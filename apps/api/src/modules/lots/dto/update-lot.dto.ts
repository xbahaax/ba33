import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsNumberString } from 'class-validator';

export class UpdateLotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  actualWeightKg?: string;

  @ApiPropertyOptional({ enum: ['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat'] })
  @IsOptional()
  @IsEnum(['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat'])
  stateQuick?: string;

  @ApiPropertyOptional({ enum: ['normal', 'urgent'] })
  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  urgency?: string;

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
  currentLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentLocationType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLotStatusDto {
  @ApiPropertyOptional({
    enum: [
      'announced', 'collected', 'in_transit', 'received_depot', 'in_pretri',
      'stored', 'dispatched_to_laverie', 'received_laverie', 'washing', 'washed',
      'qualified', 'dispatched_to_d3', 'dispatched_to_d4', 'in_transformation',
      'transformed', 'certified', 'sold', 'delivered', 'rejected', 'lost', 'quarantined',
    ],
  })
  @IsString()
  status: string;
}
