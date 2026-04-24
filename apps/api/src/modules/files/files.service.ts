import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesRepository } from './files.repository';
import { v4 as uuid } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly storagePath: string;

  constructor(private readonly filesRepository: FilesRepository) {
    this.storagePath = process.env.FILE_STORAGE_PATH || './uploads';
  }

  async upload(
    file: Express.Multer.File,
    kind: 'photo' | 'voice_note' | 'signature' | 'document' | 'certificate_pdf',
    uploadedBy?: string,
  ) {
    const id = uuid();
    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${id}.${ext}`;
    const dirPath = join(this.storagePath, kind);
    const filePath = join(dirPath, filename);

    await mkdir(dirPath, { recursive: true });
    await writeFile(filePath, file.buffer);

    const record = await this.filesRepository.create({
      id,
      kind,
      mimeType: file.mimetype,
      storagePath: filePath,
      sizeBytes: file.size,
      uploadedBy,
    });

    return record;
  }

  async getFileInfo(id: string) {
    const file = await this.filesRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return file;
  }

  async getFilePath(id: string): Promise<string> {
    const file = await this.filesRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return file.storagePath;
  }
}
