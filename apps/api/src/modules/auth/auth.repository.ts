import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { buyers, users } from '../../common/database/schema';
import type { AuthUserProfile } from './auth-read-model';

export interface RegisterInput {
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  registrationNumber: string;
}

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  userType: 'buyer';
  profile: AuthUserProfile;
}

export type AuthSessionUser = Omit<AuthUser, 'passwordHash'>;
export type AuthProfileUpdates = Partial<Omit<AuthUserProfile, 'notifications'>> & {
  notifications?: Partial<AuthUserProfile['notifications']>;
};

type BuyerProfileMeta = Partial<Omit<AuthUserProfile, 'companyName' | 'registrationNumber' | 'preferredChannel'>>;

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

  async findByEmail(email: string): Promise<AuthUser | undefined> {
    const rows = await this.db
      .select({ user: users, buyer: buyers })
      .from(users)
      .leftJoin(buyers, eq(users.id, buyers.userId))
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return rows[0] ? this.toAuthUser(rows[0].user, rows[0].buyer) : undefined;
  }

  async findById(userId: string): Promise<AuthUser | undefined> {
    const rows = await this.db
      .select({ user: users, buyer: buyers })
      .from(users)
      .leftJoin(buyers, eq(users.id, buyers.userId))
      .where(eq(users.id, userId))
      .limit(1);

    return rows[0] ? this.toAuthUser(rows[0].user, rows[0].buyer) : undefined;
  }

  async createUser(input: RegisterInput): Promise<AuthUser> {
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

    const [firstName = input.fullName, ...lastNameParts] = input.fullName.split(' ').filter(Boolean);
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

    return this.toAuthUser(createdUser, createdBuyer);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<AuthUser | undefined> {
    await this.db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
    return this.findById(userId);
  }

  async updateProfile(userId: string, updates: AuthProfileUpdates): Promise<AuthSessionUser | undefined> {
    const existing = await this.findById(userId);

    if (!existing) {
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

    const updated = await this.findById(userId);
    return updated ? this.toSessionUser(updated) : undefined;
  }

  toSessionUser(user: AuthUser): AuthSessionUser {
    const { passwordHash, ...sessionUser } = user;
    return sessionUser;
  }

  private toAuthUser(user: typeof users.$inferSelect, buyer: typeof buyers.$inferSelect | null): AuthUser {
    if (!buyer) {
      throw new Error(`Buyer profile missing for user ${user.id}`);
    }

    const meta = this.parseProfileMeta(buyer.billingAddress);

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      userType: 'buyer',
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

  private parseProfileMeta(value: unknown): BuyerProfileMeta {
    return value && typeof value === 'object' ? (value as BuyerProfileMeta) : defaultProfileMeta;
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
