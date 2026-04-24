import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, notInArray } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { regions, roles, userRoles, users } from '../../common/database/schema';

type UserRecord = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  userType: string;
  status: string | null;
  regionId: string | null;
  regionName: string | null;
  lastLoginAt: Date | null;
};

export type AuthenticatedUserRecord = UserRecord & {
  assignedRoles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
};

@Injectable()
export class AuthRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findUserByEmail(email: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        userType: users.userType,
        status: users.status,
        regionId: users.regionId,
        regionName: regions.name,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    return this.attachAssignedRoles(user);
  }

  async findUserById(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        userType: users.userType,
        status: users.status,
        regionId: users.regionId,
        regionName: regions.name,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return this.attachAssignedRoles(user);
  }

  async listInternalPersonas() {
    return this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        userType: users.userType,
        status: users.status,
      })
      .from(users)
      .where(notInArray(users.userType, ['buyer', 'institutional']))
      .orderBy(asc(users.fullName));
  }

  private async attachAssignedRoles(user: UserRecord): Promise<AuthenticatedUserRecord> {
    const assignedRolesRows = await this.db
      .select({
        id: roles.id,
        name: roles.name,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    return {
      ...user,
      assignedRoles: assignedRolesRows.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: Array.isArray(role.permissions)
          ? role.permissions.filter((permission): permission is string => typeof permission === 'string')
          : [],
      })),
    };
  }
}
