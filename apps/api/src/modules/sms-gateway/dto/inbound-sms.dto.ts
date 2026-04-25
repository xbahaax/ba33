import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class InboundSmsDto {
  @ApiProperty({
    example: '+213555123456',
    description: 'Normalized sender phone number received from the SMS provider.',
  })
  @IsPhoneNumber()
  from!: string;

  @ApiProperty({
    example: 'RAM 25kg ready in Tiaret. LAT 35.3711 LNG 1.3162',
    description: 'Raw inbound SMS message.',
  })
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({
    example: 'provider-msg-001',
    description: 'Optional upstream provider message identifier.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  providerMessageId?: string;

  @ApiPropertyOptional({ example: 35.3711 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 1.3162 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  geolocationPrecisionMeters?: number;
}
