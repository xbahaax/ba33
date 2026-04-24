import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPickupDto {
  @ApiProperty({ description: 'Actual weight in kg measured at pickup' })
  @IsString()
  weight: string;

  @ApiProperty({ description: 'Wool state: clean, dirty, very_dirty, contaminated, with_meat', required: false })
  @IsOptional()
  @IsString()
  stateQuick?: string;

  @ApiProperty({ description: 'Optional notes from the transporter', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
