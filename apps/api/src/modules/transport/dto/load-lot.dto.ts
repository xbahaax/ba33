import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class LoadLotDto {
  @ApiProperty({ description: 'Loaded weight in kg' })
  @IsNumberString()
  weight: string;
}
