import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ example: 'admin@ba33.dz' })
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '0555123456' })
  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
