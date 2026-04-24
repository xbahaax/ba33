import { IsBoolean, IsOptional } from 'class-validator';

export class IssueCertificationDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
