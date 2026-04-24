import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class CreateTransporterDto {
  @ApiProperty({ description: 'User ID for the transporter' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Vehicle information (JSON)' })
  @IsOptional()
  vehicleInfo?: unknown;

  @ApiPropertyOptional({ description: 'Certifications data (JSON)' })
  @IsOptional()
  certifications?: unknown;
}
