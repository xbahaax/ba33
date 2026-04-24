import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AcceptJobDto {
  @ApiProperty({ description: 'Transporter user ID' })
  @IsUUID()
  transporterId: string;
}
