import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDepotReceptionDto {
  @IsUUID()
  depotId!: string;

  @IsUUID()
  lotId!: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @IsNumber()
  @Min(0.01)
  actualWeightKg!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
