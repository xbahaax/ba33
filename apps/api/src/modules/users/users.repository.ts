import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { regions, roles, userRoles, users } from '../../common/database/schema';
import {
  defaultRoleTemplates,
  getDefaultPermissionsForUserType,
  mergePermissions,
} from '../../common/auth/rbac';
import type { UpdateUserAccessDto } from './dto/update-user-access.dto';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getOverview() {
    const typeBreakdown = await this.db
      .select({
        userType: users.userType,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.userType)
      .orderBy(users.userType);

    const statusBreakdown = await this.db
      .select({
        status: users.status,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.status)
      .orderBy(users.status);

    const recentUsers = await this.db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        userType: users.userType,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        regionName: regions.name,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .orderBy(desc(users.createdAt))
      .limit(12);

    const statusMap = new Map(statusBreakdown.map((row) => [row.status, row.count]));

    return {
      summary: {
        totalUsers: typeBreakdown.reduce((sum, row) => sum + row.count, 0),
        activeUsers: statusMap.get('active') ?? 0,
        suspendedUsers: statusMap.get('suspended') ?? 0,
        deletedUsers: statusMap.get('deleted') ?? 0,
        typeBreakdown,
        statusBreakdown,
      },
      users: recentUsers,
    };
  }

  async getAccessOverview() {
    const roleRows = await this.ensureDefaultRoles();

    const userRows = await this.db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        userType: users.userType,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        regionName: regions.name,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .orderBy(desc(users.createdAt));

    const assignedRoleRows = await this.db
      .select({
        userId: userRoles.userId,
        roleId: roles.id,
        roleName: roles.name,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id));

    const assignmentsByUser = new Map<
      string,
      Array<{ id: string; name: string; permissions: string[] }>
    >();

    for (const row of assignedRoleRows) {
      const current = assignmentsByUser.get(row.userId) ?? [];
      current.push({
        id: row.roleId,
        name: row.roleName,
        permissions: Array.isArray(row.permissions)
          ? row.permissions.filter((permission): permission is string => typeof permission === 'string')
          : [],
      });
      assignmentsByUser.set(row.userId, current);
    }

    const accessUsers = userRows.map((user) => {
      const assignedRolesForUser = assignmentsByUser.get(user.id) ?? [];
      const baselinePermissions = getDefaultPermissionsForUserType(user.userType);
      const effectivePermissions =
        user.status === 'active'
          ? mergePermissions(
              baselinePermissions,
              assignedRolesForUser.flatMap((role) => role.permissions),
            )
          : [];

      return {
        ...user,
        assignedRoles: assignedRolesForUser,
        baselinePermissions,
        effectivePermissions,
      };
    });

    return {
      summary: {
        totalUsers: accessUsers.length,
        activeUsers: accessUsers.filter((user) => user.status === 'active').length,
        suspendedUsers: accessUsers.filter((user) => user.status === 'suspended').length,
        webOperationsUsers: accessUsers.filter((user) => user.effectivePermissions.length > 0).length,
      },
      roles: roleRows,
      users: accessUsers,
    };
  }

  async updateAccess(userId: string, input: UpdateUserAccessDto) {
    await this.ensureDefaultRoles();

    const [existingUser] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    await this.db.transaction(async (tx) => {
      if (input.status) {
        await tx
          .update(users)
          .set({
            status: input.status,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }

      if (input.roleIds) {
        if (input.roleIds.length > 0) {
          const existingRoles = await tx
            .select({ id: roles.id })
            .from(roles)
            .where(inArray(roles.id, input.roleIds));

          if (existingRoles.length !== input.roleIds.length) {
            throw new BadRequestException('One or more role ids are invalid.');
          }
        }

        await tx.delete(userRoles).where(eq(userRoles.userId, userId));

        if (input.roleIds.length > 0) {
          await tx.insert(userRoles).values(
            input.roleIds.map((roleId) => ({
              userId,
              roleId,
            })),
          );
        }
      }
    });

    const accessOverview = await this.getAccessOverview();
    return accessOverview.users.find((user) => user.id === userId) ?? null;
  }

  private async ensureDefaultRoles() {
    for (const roleTemplate of defaultRoleTemplates) {
      await this.db
        .insert(roles)
        .values({
          name: roleTemplate.name,
          permissions: roleTemplate.permissions,
        })
        .onConflictDoUpdate({
          target: roles.name,
          set: {
            permissions: roleTemplate.permissions,
            updatedAt: new Date(),
          },
        });
    }

    return this.db
      .select({
        id: roles.id,
        name: roles.name,
        permissions: roles.permissions,
      })
      .from(roles)
      .orderBy(roles.name);
  }
}
