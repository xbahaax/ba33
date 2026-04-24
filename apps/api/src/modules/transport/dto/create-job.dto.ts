import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsIn, IsOptional, IsDateString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Origin type (e.g. "depot")' })
  @IsString()
  originType: string;

  @ApiProperty({ description: 'Origin ID' })
  @IsUUID()
  originId: string;

  @ApiProperty({ description: 'Destination type (e.g. "laverie")' })
  @IsString()
  destinationType: string;

  @ApiProperty({ description: 'Destination ID' })
  @IsUUID()
  destinationId: string;

  @ApiProperty({
    description: 'Transport lane',
    enum: ['normal', 'urgent_cold_chain', 'urgent_standard'],
  })
  @IsIn(['normal', 'urgent_cold_chain', 'urgent_standard'])
  lane: 'normal' | 'urgent_cold_chain' | 'urgent_standard';

  @ApiPropertyOptional({ description: 'SLA deadline (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  slaDeadline?: string;
}
