import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CompleteProductionRunDto {
  @IsNumber()
  @Min(0.01)
  outputWeightKg!: number;

  @IsNumber()
  @Min(0)
  wasteWeightKg!: number;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsOptional()
  @IsString()
  productCode?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}
