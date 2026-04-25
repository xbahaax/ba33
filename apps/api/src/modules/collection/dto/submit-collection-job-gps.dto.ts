import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class CollectionJobGpsPointDto {
  @ApiProperty()
  @IsNumberString()
  lat: string;

  @ApiProperty()
  @IsNumberString()
  lng: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  speedMps?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  accuracy?: string;

  @ApiProperty({ description: 'ISO 8601 timestamp' })
  @IsDateString()
  recordedAt: string;
}

export class SubmitCollectionJobGpsDto {
  @ApiProperty({ type: [CollectionJobGpsPointDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CollectionJobGpsPointDto)
  points: CollectionJobGpsPointDto[];
}
