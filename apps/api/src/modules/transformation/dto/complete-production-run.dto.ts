import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteProductionRunDto {
  @ApiProperty({ minimum: 0.01, description: 'Poids Net Sec en sortie' })
  @IsNumber() @Min(0.01) outputWeightKg!: number;

  @ApiProperty({ minimum: 0 }) @IsNumber() @Min(0) wasteWeightKg!: number;
  @ApiProperty({ minimum: 0.01 }) @IsNumber() @Min(0.01) quantity!: number;

  @ApiPropertyOptional({ description: 'Numéro de Lot Final — code unique reliant la sortie aux collecteurs d\'origine' })
  @IsOptional() @IsString() productCode?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
}
