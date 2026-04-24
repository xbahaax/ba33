import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';

@Injectable()
export class CertificationRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    productId: string;
    productCode: string;
    status?: 'pending' | 'issued' | 'revoked';
    gatesPassed?: unknown;
    signature?: string;
    issuedBy?: string;
    issuedAt?: Date;
    qrCodeUrl: string;
  }) {
    const [cert] = await this.db
      .insert(certifications)
      .values(data)
      .returning();
    return cert;
  }

  async findById(id: string) {
    const [cert] = await this.db
      .select()
      .from(certifications)
      .where(eq(certifications.id, id));
    return cert ?? null;
  }

  async findByProductId(productId: string) {
    const [cert] = await this.db
      .select()
      .from(certifications)
      .where(eq(certifications.productId, productId));
    return cert ?? null;
  }

  async findByProductCode(code: string) {
    const [cert] = await this.db
      .select()
      .from(certifications)
      .where(eq(certifications.productCode, code));
    return cert ?? null;
  }

  async update(
    id: string,
    data: {
      status?: 'pending' | 'issued' | 'revoked';
      issuedBy?: string;
      issuedAt?: Date;
      revokedAt?: Date;
      revokedReason?: string;
      updatedAt?: Date;
    },
  ) {
    const [cert] = await this.db
      .update(certifications)
      .set(data)
      .where(eq(certifications.id, id))
      .returning();
    return cert;
  }
}
