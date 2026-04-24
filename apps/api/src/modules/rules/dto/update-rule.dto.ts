import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateRuleDto {
  @IsOptional()
  @IsObject()
  value?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;
}
