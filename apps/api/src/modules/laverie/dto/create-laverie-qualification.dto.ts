import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLaverieQualificationDto {
  @ApiProperty() @IsUUID() washingRunId!: string;
  @ApiProperty({ minimum: 0.01, description: 'Poids Net Sec après séchage industriel' })
  @IsNumber() @Min(0.01) cleanWeightKg!: number;

  @ApiProperty({ enum: ['A', 'B', 'C', 'reject'] }) @IsIn(['A', 'B', 'C', 'reject']) grade!: 'A' | 'B' | 'C' | 'reject';
  @ApiProperty({ enum: ['clear', 'flagged', 'rejected'] }) @IsIn(['clear', 'flagged', 'rejected']) safetyStatus!: 'clear' | 'flagged' | 'rejected';

  @ApiPropertyOptional({ description: 'Longueur de mèche (mm)' })
  @IsOptional() @IsNumber() @Min(0) fiberLengthMm?: number;

  @ApiPropertyOptional({ description: 'Finesse des fibres (microns)' })
  @IsOptional() @IsNumber() @Min(0) fiberDiameterMicron?: number;

  @ApiPropertyOptional({ description: 'Taux d\'humidité résiduelle % (cible 12–15%)' })
  @IsOptional() @IsNumber() @Min(0) moisturePercent?: number;

  @ApiPropertyOptional({ description: 'Note de propreté 1–5' })
  @IsOptional() @IsInt() @Min(1) @Max(5) cleanlinessScore?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contaminationNotes?: string;

  @ApiProperty({ enum: ['d3_textile', 'd4_bio', 'quarantine', 'reject'] })
  @IsIn(['d3_textile', 'd4_bio', 'quarantine', 'reject']) dispatchTrack!: 'd3_textile' | 'd4_bio' | 'quarantine' | 'reject';

  @ApiPropertyOptional() @IsOptional() @IsUUID() targetTransformerId?: string;

  // Stage 7 — Sortie laverie / Certificat de pureté
  @ApiPropertyOptional({ description: 'Taux d\'humidité résiduelle % (cible 12–15%)' })
  @IsOptional() @IsNumber() @Min(0) residualHumidityPercent?: number;

  @ApiPropertyOptional({ description: 'Taux de suint résiduel (Lanoline) % (cible < 1%)' })
  @IsOptional() @IsNumber() @Min(0) residualSuintPercent?: number;

  @ApiPropertyOptional({ description: 'Blancheur — Indice de jaunissement' })
  @IsOptional() @IsNumber() whitenessIndex?: number;

  @ApiPropertyOptional({ description: 'pH de la laine (neutre pour fixations métalliques)' })
  @IsOptional() @IsNumber() @Min(0) @Max(14) phLevel?: number;

  @ApiPropertyOptional({ description: 'Énergie consommée pour le séchage (kWh)' })
  @IsOptional() @IsNumber() @Min(0) energyKwhUsed?: number;

  @ApiPropertyOptional({ description: 'Volume d\'eau utilisé par kg de laine (L/kg)' })
  @IsOptional() @IsNumber() @Min(0) waterLitersPerKg?: number;
}
