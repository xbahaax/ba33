import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'File kind',
    enum: ['photo', 'voice_note', 'signature', 'document', 'certificate_pdf'],
  })
  @IsString()
  @IsIn(['photo', 'voice_note', 'signature', 'document', 'certificate_pdf'])
  kind: 'photo' | 'voice_note' | 'signature' | 'document' | 'certificate_pdf';

  @ApiPropertyOptional({ description: 'UUID of the user who uploaded the file' })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;
}
