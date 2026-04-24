import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateDepotDispatchDto {
  @IsUUID()
  depotId!: string;

  @IsUUID()
  lotId!: string;

  @IsUUID()
  destinationLaverieId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  manifestWeightKg?: number;
}
