import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class QueryEntityHistoryDto {
  @ApiProperty({ description: 'Aggregate type (e.g. lot, source, user)' })
  @IsString()
  aggregateType: string;

  @ApiProperty({ description: 'Aggregate ID' })
  @IsUUID()
  aggregateId: string;
}

export class QueryEventsSinceDto {
  @ApiProperty({ description: 'ISO date string for delta sync' })
  @IsDateString()
  recordedAt: string;
}

export class QueryEventsByTypeDto {
  @ApiProperty({ description: 'Event type to filter by' })
  @IsString()
  eventType: string;

  @ApiPropertyOptional({ description: 'Start of date range (ISO)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End of date range (ISO)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
