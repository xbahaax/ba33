import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class CreateRouteDto {
  @ApiProperty({ description: 'Collector user ID' })
  @IsUUID()
  collectorId: string;

  @ApiProperty({ description: 'Route date (ISO 8601)' })
  @IsDateString()
  date: string;
}
