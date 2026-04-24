import { IsString } from 'class-validator';

export class RevokeCertificationDto {
  @IsString()
  reason!: string;
}
