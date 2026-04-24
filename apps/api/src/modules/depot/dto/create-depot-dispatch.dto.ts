import { IsNumber, IsOptional, IsUUID, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';

export class CreateDepotDispatchDto {
  @ApiProperty() @IsUUID() depotId!: string;
  @ApiProperty() @IsUUID() lotId!: string;

  // Stage 4 — either laverie or direct transformer destination
  @ApiPropertyOptional({ description: 'Laverie de destination (Flux A — isolation/engrais propre)' })
  @IsOptional() @IsUUID() destinationLaverieId?: string;

  @ApiPropertyOptional({ description: 'Transformateur direct de destination (Flux B — engrais brut)' })
  @IsOptional() @IsUUID() destinationTransformerId?: string;

  @ApiPropertyOptional({ minimum: 0.01 })
  @IsOptional() @IsNumber() @Min(0.01) manifestWeightKg?: number;

  // Stage 4 — Sortie dépositaire
  @ApiPropertyOptional({ description: 'Volume Flux A (Isolation) en kg' })
  @IsOptional() @IsNumber() @Min(0) fluxAWeightKg?: number;

  @ApiPropertyOptional({ description: 'Volume Flux B (Engrais) en kg' })
  @IsOptional() @IsNumber() @Min(0) fluxBWeightKg?: number;

  @ApiPropertyOptional({ description: 'Taux d\'impuretés estimé VM%' })
  @IsOptional() @IsNumber() @Min(0) impurityRatePercent?: number;

  @ApiPropertyOptional({ description: 'Degré d\'humidité H% (mesurer avant transport)' })
  @IsOptional() @IsNumber() @Min(0) humidityExitPercent?: number;

  @ApiPropertyOptional({ enum: ['laverie', 'transformer_direct'] })
  @IsOptional() @IsIn(['laverie', 'transformer_direct']) destinationDirect?: 'laverie' | 'transformer_direct';
}
