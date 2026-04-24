import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { users, sessions } from '../../common/database/schema';

@Injectable()
export class AuthRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findUserByPhone(phone: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);
    return result[0] ?? null;
  }

  async createSession(
    userId: string,
    refreshTokenHash: string,
    deviceInfo: Record<string, unknown> | null,
    expiresAt: Date,
  ) {
    const result = await this.db
      .insert(sessions)
      .values({
        userId,
        refreshTokenHash,
        deviceInfo,
        expiresAt,
      })
      .returning();
    return result[0];
  }

  async findSessionByToken(refreshTokenHash: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, refreshTokenHash),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async revokeSession(sessionId: string) {
    const result = await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId))
      .returning();
    return result[0];
  }

  async findUserById(userId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return result[0] ?? null;
  }
}
