import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import {
  defaultRoleTemplates,
  getDefaultPermissionsForUserType,
  mergePermissions,
} from '../../common/auth/rbac';
import type { Database } from '../../common/database/client';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import { buyers, regions, roles, userRoles, users } from '../../common/database/schema';
import type { AuthUserProfile } from './auth-read-model';

export interface RegisterInput {
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  registrationNumber: string;
}

export interface BuyerAuthUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  userType: string;
  profile: AuthUserProfile | null;
}

export interface AuthAssignedRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface OperationsSessionUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  userType: string;
  status: string;
  regionId: string | null;
  regionName: string | null;
  lastLoginAt: string | null;
}

export interface OperationsSessionResponse {
  user: OperationsSessionUser;
  permissions: string[];
  assignedRoles: AuthAssignedRole[];
  hasWebOperationsAccess: boolean;
}

export interface DevPersona {
  id: string;
  email: string;
  fullName: string;
  userType: string;
  status: string;
}

export interface OperationsAuthUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  userType: string;
  status: string;
  regionId: string | null;
  regionName: string | null;
  lastLoginAt: Date | null;
}

export type AuthSessionUser = Omit<BuyerAuthUser, 'passwordHash'>;
export type AuthProfileUpdates = Partial<Omit<AuthUserProfile, 'notifications'>> & {
  notifications?: Partial<AuthUserProfile['notifications']>;
};

type BuyerProfileMeta = Partial<
  Omit<AuthUserProfile, 'companyName' | 'registrationNumber' | 'preferredChannel'>
>;

const defaultProfileMeta: BuyerProfileMeta = {
  sector: 'Textile technique',
  website: '',
  firstName: '',
  lastName: '',
  phone: '',
  language: 'fr',
  currency: 'DZD',
  twoFactorEnabled: false,
  notifications: {
    orderConfirmations: true,
    shipments: true,
    newAvailability: false,
    offers: false,
  },
};

@Injectable()
export class AuthRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findBuyerByEmail(email: string): Promise<BuyerAuthUser | undefined> {
    const rows = await this.db
      .select({ user: users, buyer: buyers })
      .from(users)
      .leftJoin(buyers, eq(users.id, buyers.userId))
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return rows[0]?.buyer ? this.toBuyerAuthUser(rows[0].user, rows[0].buyer) : undefined;
  }

  async findBuyerByPhone(phone: string): Promise<BuyerAuthUser | undefined> {
    const phoneVariants = normalizePhoneVariants(phone);
    const rows = await this.db
      .select({ user: users, buyer: buyers })
      .from(users)
      .leftJoin(buyers, eq(users.id, buyers.userId))
      .where(inArray(users.phone, phoneVariants))
      .limit(1);

    return rows[0]?.buyer ? this.toBuyerAuthUser(rows[0].user, rows[0].buyer) : undefined;
  }

  async findBuyerById(userId: string): Promise<BuyerAuthUser | undefined> {
    const rows = await this.db
      .select({ user: users, buyer: buyers })
      .from(users)
      .leftJoin(buyers, eq(users.id, buyers.userId))
      .where(eq(users.id, userId))
      .limit(1);

    return rows[0]?.buyer ? this.toBuyerAuthUser(rows[0].user, rows[0].buyer) : undefined;
  }

  async findOperationsUserByPhone(phone: string): Promise<OperationsAuthUser | undefined> {
    const phoneVariants = normalizePhoneVariants(phone);
    const rows = await this.db
      .select({
        user: users,
        regionName: regions.name,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .where(inArray(users.phone, phoneVariants))
      .limit(1);

    const user = rows[0] ? this.toOperationsAuthUser(rows[0].user, rows[0].regionName) : undefined;
    return user ?? undefined;
  }

  async findOperationsUserByEmail(email: string): Promise<OperationsAuthUser | undefined> {
    const rows = await this.db
      .select({
        user: users,
        regionName: regions.name,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    const user = rows[0] ? this.toOperationsAuthUser(rows[0].user, rows[0].regionName) : undefined;
    return user && this.hasOperationsAccessProfile(user.userType) ? user : undefined;
  }

  async findOperationsUserById(userId: string): Promise<OperationsAuthUser | undefined> {
    const rows = await this.db
      .select({
        user: users,
        regionName: regions.name,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .where(eq(users.id, userId))
      .limit(1);

    const user = rows[0] ? this.toOperationsAuthUser(rows[0].user, rows[0].regionName) : undefined;
    return user && this.hasOperationsAccessProfile(user.userType) ? user : undefined;
  }

  async listDevPersonas(): Promise<DevPersona[]> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        userType: users.userType,
        status: users.status,
      })
      .from(users)
      .orderBy(asc(users.status), asc(users.userType), asc(users.fullName));

    return rows
      .filter((row) => this.hasOperationsAccessProfile(row.userType))
      .map((row) => ({
        id: row.id,
        email: row.email,
        fullName: row.fullName,
        userType: row.userType,
        status: row.status ?? 'active',
      }));
  }

  async createUser(input: RegisterInput): Promise<BuyerAuthUser> {
    const [createdUser] = await this.db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        fullName: input.fullName,
        userType: 'buyer',
        status: 'active',
      })
      .returning();

    const [firstName = input.fullName, ...lastNameParts] = input.fullName
      .split(' ')
      .filter(Boolean);
    const profileMeta: BuyerProfileMeta = {
      ...defaultProfileMeta,
      firstName,
      lastName: lastNameParts.join(' '),
    };

    const [createdBuyer] = await this.db
      .insert(buyers)
      .values({
        userId: createdUser.id,
        companyName: input.companyName,
        registrationNumber: input.registrationNumber,
        preferredChannel: 'national',
        creditLimit: '0',
        billingAddress: profileMeta,
        shippingAddresses: [],
      })
      .returning();

    return this.toBuyerAuthUser(createdUser, createdBuyer);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<BuyerAuthUser | undefined> {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return this.findBuyerById(userId);
  }

  async updateProfile(userId: string, updates: AuthProfileUpdates): Promise<AuthSessionUser | undefined> {
    const existing = await this.findBuyerById(userId);

    if (!existing || !existing.profile) {
      return undefined;
    }

    const nextProfile: AuthUserProfile = {
      ...existing.profile,
      ...updates,
      notifications: {
        ...existing.profile.notifications,
        ...updates.notifications,
      },
    };

    await this.db
      .update(users)
      .set({
        fullName: `${nextProfile.firstName} ${nextProfile.lastName}`.trim() || existing.fullName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await this.db
      .update(buyers)
      .set({
        companyName: nextProfile.companyName,
        registrationNumber: nextProfile.registrationNumber,
        preferredChannel: nextProfile.preferredChannel,
        billingAddress: this.toProfileMeta(nextProfile),
      })
      .where(eq(buyers.userId, userId));

    const updated = await this.findBuyerById(userId);
    return updated ? this.toSessionUser(updated) : undefined;
  }

  async touchLastLogin(userId: string) {
    await this.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  toSessionUser(user: BuyerAuthUser): AuthSessionUser {
    const { passwordHash, ...sessionUser } = user;
    return sessionUser;
  }

  async toOperationsSession(user: OperationsAuthUser): Promise<OperationsSessionResponse> {
    await this.ensureDefaultRoles();
    const assignedRoles = await this.getAssignedRoles(user.id);
    const baselinePermissions =
      user.status === 'active' ? getDefaultPermissionsForUserType(user.userType) : [];
    const effectivePermissions =
      user.status === 'active'
        ? mergePermissions(
            baselinePermissions,
            assignedRoles.flatMap((role) => role.permissions),
          )
        : [];

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        userType: user.userType,
        status: user.status,
        regionId: user.regionId,
        regionName: user.regionName,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      },
      permissions: effectivePermissions,
      assignedRoles,
      hasWebOperationsAccess: effectivePermissions.length > 0,
    };
  }

  private async getAssignedRoles(userId: string): Promise<AuthAssignedRole[]> {
    const rows = await this.db
      .select({
        id: roles.id,
        name: roles.name,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .orderBy(asc(roles.name));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      permissions: Array.isArray(row.permissions)
        ? row.permissions.filter((permission): permission is string => typeof permission === 'string')
        : [],
    }));
  }

  private hasOperationsAccessProfile(userType: string) {
    return getDefaultPermissionsForUserType(userType).length > 0;
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
  }

  private toBuyerAuthUser(
    user: typeof users.$inferSelect,
    buyer: typeof buyers.$inferSelect,
  ): BuyerAuthUser {
    const meta = this.parseProfileMeta(buyer.billingAddress);

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      userType: user.userType,
      profile: {
        companyName: buyer.companyName,
        registrationNumber: buyer.registrationNumber ?? '',
        preferredChannel: buyer.preferredChannel,
        sector: meta.sector ?? 'Textile technique',
        website: meta.website ?? '',
        firstName: meta.firstName ?? user.fullName.split(' ')[0] ?? user.fullName,
        lastName: meta.lastName ?? user.fullName.split(' ').slice(1).join(' '),
        phone: meta.phone ?? '',
        language: meta.language ?? 'fr',
        currency: meta.currency ?? 'DZD',
        twoFactorEnabled: meta.twoFactorEnabled ?? false,
        notifications: {
          ...defaultProfileMeta.notifications!,
          ...meta.notifications,
        },
      },
    };
  }

  private toOperationsAuthUser(
    user: typeof users.$inferSelect,
    regionName: string | null,
  ): OperationsAuthUser {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      phone: user.phone ?? null,
      userType: user.userType,
      status: user.status ?? 'active',
      regionId: user.regionId ?? null,
      regionName,
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }

  private parseProfileMeta(value: unknown): BuyerProfileMeta {
    return value && typeof value === 'object'
      ? (value as BuyerProfileMeta)
      : defaultProfileMeta;
  }

  private toProfileMeta(profile: AuthUserProfile): BuyerProfileMeta {
    return {
      sector: profile.sector,
      website: profile.website,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      language: profile.language,
      currency: profile.currency,
      twoFactorEnabled: profile.twoFactorEnabled,
      notifications: profile.notifications,
    };
  }
}

function normalizePhoneVariants(phone: string) {
  const trimmed = phone.trim().replace(/[\s.-]/g, '');
  const digits = trimmed.replace(/^\+/, '');
  const variants = new Set<string>([trimmed]);

  if (digits.startsWith('213') && digits.length > 3) {
    const national = `0${digits.slice(3)}`;
    variants.add(national);
    variants.add(`+${digits}`);
    variants.add(digits);
  }

  if (digits.startsWith('0') && digits.length > 1) {
    const significant = digits.slice(1);
    variants.add(significant);
    variants.add(`213${significant}`);
    variants.add(`+213${significant}`);
  }

  if (!digits.startsWith('0') && !digits.startsWith('213')) {
    variants.add(`0${digits}`);
    variants.add(`213${digits}`);
    variants.add(`+213${digits}`);
  }

  return [...variants];
}
