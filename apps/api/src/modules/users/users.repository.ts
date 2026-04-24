import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { users } from '../../common/database/schema';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  userType:
    | 'collector'
    | 'depot_manager'
    | 'laverie_operator'
    | 'transformer_operator'
    | 'sales_agent'
    | 'central_admin'
    | 'regional_manager'
    | 'buyer'
    | 'institutional'
    | 'system';
  regionId?: string;
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  fullName?: string;
  phone?: string;
  userType?: CreateUserData['userType'];
  status?: 'active' | 'suspended' | 'deleted';
  regionId?: string;
}

export interface UserFilters {
  userType?: string;
  status?: string;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findAll(filters?: UserFilters) {
    const conditions = [];

    if (filters?.userType) {
      conditions.push(eq(users.userType, filters.userType as any));
    }
    if (filters?.status) {
      conditions.push(eq(users.status, filters.status as any));
    }

    if (conditions.length > 0) {
      return this.db
        .select()
        .from(users)
        .where(and(...conditions));
    }

    return this.db.select().from(users);
  }

  async create(data: CreateUserData) {
    const result = await this.db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone ?? null,
        userType: data.userType,
        regionId: data.regionId ?? null,
      })
      .returning();
    return result[0];
  }

  async update(id: string, data: UpdateUserData) {
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.passwordHash !== undefined) updatePayload.passwordHash = data.passwordHash;
    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.userType !== undefined) updatePayload.userType = data.userType;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.regionId !== undefined) updatePayload.regionId = data.regionId;

    const result = await this.db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning();
    return result[0] ?? null;
  }
}
