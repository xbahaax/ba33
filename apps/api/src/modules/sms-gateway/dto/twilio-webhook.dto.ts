import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TwilioWebhookDto {
  @ApiPropertyOptional({ example: '+213555123456' })
  @IsOptional()
  @IsString()
  From?: string;

  @ApiPropertyOptional({ example: 'RAM 25kg ready in Tiaret' })
  @IsOptional()
  @IsString()
  Body?: string;

  @ApiPropertyOptional({ example: 'SM123456789' })
  @IsOptional()
  @IsString()
  MessageSid?: string;

  @ApiPropertyOptional({ example: '35.3711' })
  @IsOptional()
  @IsString()
  Latitude?: string;

  @ApiPropertyOptional({ example: '1.3162' })
  @IsOptional()
  @IsString()
  Longitude?: string;

  @ApiPropertyOptional({ example: '15' })
  @IsOptional()
  @IsString()
  Address?: string;
}
