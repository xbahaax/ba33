import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateLaverieQualificationDto {
  @IsUUID()
  washingRunId!: string;

  @IsNumber()
  @Min(0.01)
  cleanWeightKg!: number;

  @IsIn(['A', 'B', 'C', 'reject'])
  grade!: 'A' | 'B' | 'C' | 'reject';

  @IsIn(['clear', 'flagged', 'rejected'])
  safetyStatus!: 'clear' | 'flagged' | 'rejected';

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiberLengthMm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiberDiameterMicron?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  moisturePercent?: number;

  @IsOptional()
  @IsInt()
  cleanlinessScore?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  contaminationNotes?: string;

  @IsIn(['d3_textile', 'd4_bio', 'quarantine', 'reject'])
  dispatchTrack!: 'd3_textile' | 'd4_bio' | 'quarantine' | 'reject';

  @IsOptional()
  @IsUUID()
  targetTransformerId?: string;
}
