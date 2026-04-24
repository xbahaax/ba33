import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum, IsString } from 'class-validator';

export class AddSignatureDto {
  @ApiProperty({ enum: ['digital', 'thumbprint', 'paper_photo'] })
  @IsEnum(['digital', 'thumbprint', 'paper_photo'])
  type: 'digital' | 'thumbprint' | 'paper_photo';

  @ApiProperty()
  @IsUUID()
  fileId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signedByName?: string;
}
