import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignCollectionJobDto {
  @ApiProperty({ description: 'Collector user ID to assign the job to' })
  @IsUUID()
  collectorId: string;
}
