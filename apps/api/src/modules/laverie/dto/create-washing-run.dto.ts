import { IsNumber, IsOptional, IsUUID, Min, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWashingRunDto {
  @ApiProperty() @IsUUID() laverieId!: string;
  @ApiProperty() @IsUUID() lotId!: string;
  @ApiProperty({ minimum: 0.01 }) @IsNumber() @Min(0.01) dirtyWeightKg!: number;

  @ApiPropertyOptional({ description: 'Volume d\'eau utilisé (L) — calcul l\'eau/kg en sortie' })
  @IsOptional() @IsNumber() @Min(0) waterLiters?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() cycleDurationMinutes?: number;
  @ApiPropertyOptional({ description: 'Température de l\'eau (°C) — différente selon kératine/isolation' })
  @IsOptional() @IsNumber() waterTempC?: number;

  @ApiPropertyOptional({ description: 'Type de détergent utilisé' })
  @IsOptional() @IsString() detergentType?: string;

  @ApiPropertyOptional({ description: 'Volume de suint (lanoline) récupéré en litres' })
  @IsOptional() @IsNumber() @Min(0) suintRecoveredLiters?: number;
}
