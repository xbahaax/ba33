import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum, IsNumberString } from 'class-validator';

export class AddPhotoDto {
  @ApiProperty()
  @IsUUID()
  fileId: string;

  @ApiPropertyOptional({ enum: ['overview', 'closeup', 'surroundings', 'other'] })
  @IsOptional()
  @IsEnum(['overview', 'closeup', 'surroundings', 'other'])
  angle?: 'overview' | 'closeup' | 'surroundings' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  gpsLat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  gpsLng?: string;
}
