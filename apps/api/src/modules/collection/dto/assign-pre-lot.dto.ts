import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString } from 'class-validator';

export class AssignPreLotDto {
  @ApiProperty({ description: 'Collector user ID' })
  @IsUUID()
  collectorId: string;

  @ApiProperty({ description: 'Scheduled pickup time (ISO 8601)' })
  @IsDateString()
  scheduledAt: string;
}
