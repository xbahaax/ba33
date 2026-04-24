import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CompletePreLotDto {
  @ApiProperty({ description: 'The real lot ID created from this pre-lot' })
  @IsUUID()
  lotId: string;
}
