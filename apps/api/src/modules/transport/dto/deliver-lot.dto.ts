import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class DeliverLotDto {
  @ApiProperty({ description: 'Delivered weight in kg' })
  @IsNumberString()
  weight: string;
}
