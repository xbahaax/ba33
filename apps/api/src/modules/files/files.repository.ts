import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { files } from '../../common/database/schema';
import { eq } from 'drizzle-orm';

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
  }) {
    const [row] = await this.db
      .insert(files)
      .values(data)
      .returning();
    return row;
  }

  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(files)
      .where(eq(files.id, id))
      .limit(1);
    return row ?? null;
  }
}
