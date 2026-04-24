import { IsNumber, IsOptional, IsString, IsUUID, Min, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepotReceptionDto {
  @ApiProperty() @IsUUID() depotId!: string;
  @ApiProperty() @IsUUID() lotId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() zoneId?: string;
  @ApiProperty({ minimum: 0.01 }) @IsNumber() @Min(0.01) actualWeightKg!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  // Stage 3 — Dépositaire / Centre de tri
  @ApiPropertyOptional({ enum: ['class_a', 'class_b'], description: 'Classe A (propre) ou B (très souillée)' })
  @IsOptional() @IsIn(['class_a', 'class_b']) lotClassification?: 'class_a' | 'class_b';

  @ApiPropertyOptional({ description: 'Température du tas en °C (surveillance auto-combustion)' })
  @IsOptional() @IsNumber() stackTemperatureC?: number;

  @ApiPropertyOptional({ description: 'Taux d\'humidité critique H% à l\'entrée' })
  @IsOptional() @IsNumber() @Min(0) humidityEntryPercent?: number;

  @ApiPropertyOptional({ description: 'Taux de Matières Végétales VM% (>5% → engrais)' })
  @IsOptional() @IsNumber() @Min(0) vegetalMatterPercent?: number;

  @ApiPropertyOptional({ description: 'Date de sortie prévue vers laverie ou transformateur' })
  @IsOptional() @IsDateString() plannedExitDate?: string;
}
