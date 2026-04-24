import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class IssueBookletDto {
  @ApiProperty({ description: 'Collector user ID' })
  @IsUUID()
  collectorId: string;

  @ApiProperty({ description: 'Starting serial number' })
  @IsString()
  serialStart: string;

  @ApiProperty({ description: 'Ending serial number' })
  @IsString()
  serialEnd: string;
}
