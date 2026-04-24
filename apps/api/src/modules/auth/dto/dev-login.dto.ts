import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class DevLoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
