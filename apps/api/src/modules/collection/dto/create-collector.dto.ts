import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsArray, IsOptional } from 'class-validator';

export class CreateCollectorDto {
  @ApiProperty({ description: 'User ID for the collector' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Assigned region IDs', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  assignedRegions: string[];

  @ApiPropertyOptional({ description: 'Certifications data (JSON)' })
  @IsOptional()
  certifications?: unknown;
}
