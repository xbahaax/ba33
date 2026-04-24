import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class AddGpsPointDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNumberString()
  lat: string;

  @ApiProperty({ description: 'Longitude' })
  @IsNumberString()
  lng: string;

  @ApiPropertyOptional({ description: 'Temperature in Celsius' })
  @IsOptional()
  @IsNumberString()
  temperatureC?: string;
}
