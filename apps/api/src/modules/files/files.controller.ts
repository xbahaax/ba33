import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        kind: {
          type: 'string',
          enum: ['photo', 'voice_note', 'signature', 'document', 'certificate_pdf'],
        },
        uploadedBy: { type: 'string', format: 'uuid' },
      },
      required: ['file', 'kind'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    const record = await this.filesService.upload(file, dto.kind, dto.uploadedBy);
    return {
      id: record.id,
      kind: record.kind,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      createdAt: record.createdAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Stream file content' })
  async streamFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const fileInfo = await this.filesService.getFileInfo(id);
    const filePath = await this.filesService.getFilePath(id);

    res.set({
      'Content-Type': fileInfo.mimeType,
      'Content-Disposition': `inline; filename="${id}"`,
    });

    const stream = createReadStream(filePath);
    stream.pipe(res);
  }

  @Get(':id/info')
  @ApiOperation({ summary: 'Get file metadata' })
  async getFileInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getFileInfo(id);
  }
}
