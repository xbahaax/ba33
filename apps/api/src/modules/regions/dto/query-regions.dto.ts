import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class QueryRegionsDto {
  @ApiPropertyOptional({
    description: 'Filter by region type',
    enum: ['wilaya', 'commune', 'village'],
  })
  @IsOptional()
  @IsIn(['wilaya', 'commune', 'village'])
  type?: 'wilaya' | 'commune' | 'village';
}
