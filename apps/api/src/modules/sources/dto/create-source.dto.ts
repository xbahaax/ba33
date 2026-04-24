import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsNumber,
  IsNumberString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShepherdDetailsDto {
  @ApiProperty()
  @IsBoolean()
  hasSmartphone: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  flockSizeEstimate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  typicalYieldKgPerYear?: string;
}

export class SlaughterhouseDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  dailyCapacityHeads?: number;

  @ApiProperty()
  @IsBoolean()
  hasColdStorage: boolean;
}

export class AggregatorDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessRegistration: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  registeredUpstreamCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  premiumCertified?: boolean;
}

export class CreateSourceDto {
  @ApiProperty({ enum: ['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator'] })
  @IsEnum(['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator'])
  sourceType: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty()
  @IsUUID()
  regionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: ShepherdDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShepherdDetailsDto)
  shepherdDetails?: ShepherdDetailsDto;

  @ApiPropertyOptional({ type: SlaughterhouseDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SlaughterhouseDetailsDto)
  slaughterhouseDetails?: SlaughterhouseDetailsDto;

  @ApiPropertyOptional({ type: AggregatorDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AggregatorDetailsDto)
  aggregatorDetails?: AggregatorDetailsDto;
}
