import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class FilesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    id: string;
    kind: 'photo' | 'voice_note' | 'signature' | 'document' | 'certificate_pdf';
    mimeType: string;
    storagePath: string;
    sizeBytes: number;
    uploadedBy?: string;
    metadata?: unknown;
  }) {
    const [file] = await this.db.insert(files).values(data).returning();
    return file;
  }

  async findById(id: string) {
    const [file] = await this.db
      .select()
      .from(files)
      .where(eq(files.id, id));
    return file ?? null;
  }
}
