import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateWashingRunDto {
  @IsUUID()
  laverieId!: string;

  @IsUUID()
  lotId!: string;

  @IsNumber()
  @Min(0.01)
  dirtyWeightKg!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waterLiters?: number;

  @IsOptional()
  @IsNumber()
  cycleDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  waterTempC?: number;
}
