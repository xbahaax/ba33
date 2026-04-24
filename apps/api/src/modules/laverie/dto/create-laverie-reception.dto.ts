import { IsNumber, IsUUID, Min, IsOptional, IsIn, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLaverieReceptionDto {
  @ApiProperty() @IsUUID() laverieId!: string;
  @ApiProperty() @IsUUID() lotId!: string;
  @ApiProperty({ minimum: 0.01 }) @IsNumber() @Min(0.01) receivedWeightKg!: number;

  // Stage 5 — Entrée laverie / contrôle de réception
  @ApiPropertyOptional({ enum: ['correct', 'torn', 'humid'], description: 'État du conditionnement des balles' })
  @IsOptional() @IsIn(['correct', 'torn', 'humid']) conditioningState?: 'correct' | 'torn' | 'humid';

  @ApiPropertyOptional({ description: 'Température d\'eau requise pour le lavage (°C)' })
  @IsOptional() @IsNumber() requiredWashTempC?: number;

  @ApiPropertyOptional({ description: 'Type de détergent requis (biodégradable si eau réutilisée)' })
  @IsOptional() @IsString() requiredDetergentType?: string;
}
