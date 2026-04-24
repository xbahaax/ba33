import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateProductionRunDto {
  @IsUUID()
  transformerId!: string;

  @IsUUID()
  lotId!: string;

  @IsUUID()
  bomId!: string;

  @IsNumber()
  @Min(0.01)
  inputWeightKg!: number;
}
