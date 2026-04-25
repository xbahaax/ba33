import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class DetectBreedDto {
  @ApiProperty({
    required: false,
    description: 'Optional client hint about the current breed provider.',
    example: 'gemini',
  })
  @IsOptional()
  @IsString()
  @IsIn(['gemini', 'local'])
  provider?: 'gemini' | 'local';
}
