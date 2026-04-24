import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateLaverieReceptionDto {
  @IsUUID()
  laverieId!: string;

  @IsUUID()
  lotId!: string;

  @IsNumber()
  @Min(0.01)
  receivedWeightKg!: number;
}
