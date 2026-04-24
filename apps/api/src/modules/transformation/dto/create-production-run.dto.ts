import { IsNumber, IsUUID, Min, IsOptional, IsIn, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductionRunDto {
  @ApiProperty() @IsUUID() transformerId!: string;
  @ApiProperty() @IsUUID() lotId!: string;
  @ApiProperty() @IsUUID() bomId!: string;
  @ApiProperty({ minimum: 0.01 }) @IsNumber() @Min(0.01) inputWeightKg!: number;

  // Stage 6 — Entrée Transformateur 2 (Engrais direct, sans lavage)
  @ApiPropertyOptional({ description: 'Indice de sècheresse (la laine doit être sèche pour le broyage)' })
  @IsOptional() @IsNumber() drynessIndex?: number;

  @ApiPropertyOptional({ description: 'Présence de corps étrangers (métaux, cailloux, cuir)' })
  @IsOptional() @IsBoolean() foreignBodyPresent?: boolean;

  @ApiPropertyOptional({ description: 'Détail des corps étrangers détectés' })
  @IsOptional() @IsString() foreignBodyNotes?: string;

  @ApiPropertyOptional({ enum: ['vrac', 'balles'], description: 'Mode de déchargement' })
  @IsOptional() @IsIn(['vrac', 'balles']) unloadingMode?: 'vrac' | 'balles';

  // Stage 8 — Entrée Transformateur 1 (Isolants, Géotextiles, Feutres)
  @ApiPropertyOptional({
    enum: ['flux_a1_panels', 'flux_a2_rolls', 'flux_a3_geotextile', 'flux_b_engrais'],
    description: 'Type de produit fini: panneaux, rouleaux, géotextile ou engrais',
  })
  @IsOptional()
  @IsIn(['flux_a1_panels', 'flux_a2_rolls', 'flux_a3_geotextile', 'flux_b_engrais'])
  productDestinationType?: 'flux_a1_panels' | 'flux_a2_rolls' | 'flux_a3_geotextile' | 'flux_b_engrais';

  @ApiPropertyOptional({ description: 'Épaisseur cible du panneau (mm)' })
  @IsOptional() @IsNumber() targetThicknessMm?: number;

  @ApiPropertyOptional({ description: 'Densité cible (kg/m³)' })
  @IsOptional() @IsNumber() targetDensityKgM3?: number;

  @ApiPropertyOptional({ enum: ['natural', 'synthetic'], description: 'Traitement antimites (sel de bore = natural)' })
  @IsOptional() @IsIn(['natural', 'synthetic']) antimitesTreatmentType?: 'natural' | 'synthetic';

  @ApiPropertyOptional({ description: 'Pourcentage de fibres de liaison thermo-fusibles (biopolymère)' })
  @IsOptional() @IsNumber() @Min(0) bindingFiberPercent?: number;

  @ApiPropertyOptional({ description: 'Produit ignifuge utilisé pour classement au feu' })
  @IsOptional() @IsString() fireRetardantProduct?: string;
}
