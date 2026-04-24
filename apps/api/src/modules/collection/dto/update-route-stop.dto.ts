import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsIn } from 'class-validator';

export class UpdateRouteStopDto {
  @ApiPropertyOptional({ description: 'Arrival time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @ApiPropertyOptional({
    description: 'Stop status',
    enum: ['pending', 'completed', 'skipped'],
  })
  @IsOptional()
  @IsIn(['pending', 'completed', 'skipped'])
  status?: string;
}
