import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import { authUsersSeed, AuthUser, AuthUserProfile } from './auth-read-model';

export interface RegisterInput {
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  registrationNumber: string;
}

export type AuthSessionUser = Omit<AuthUser, 'passwordHash'>;
export type AuthProfileUpdates = Partial<Omit<AuthUserProfile, 'notifications'>> & {
  notifications?: Partial<AuthUserProfile['notifications']>;
};

@Injectable()
export class AuthRepository {
  private readonly users = [...authUsersSeed];

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  findByEmail(email: string): AuthUser | undefined {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  findById(userId: string): AuthUser | undefined {
    return this.users.find((user) => user.id === userId);
  }

  createUser(input: RegisterInput): AuthUser {
    const user: AuthUser = {
      id: `buyer-${String(this.users.length + 1).padStart(3, '0')}`,
      email: input.email,
      passwordHash: input.passwordHash,
      fullName: input.fullName,
      userType: 'buyer',
      profile: {
        companyName: input.companyName,
        registrationNumber: input.registrationNumber,
        sector: 'Textile',
        website: '',
        firstName: input.fullName.split(' ')[0] ?? input.fullName,
        lastName: input.fullName.split(' ').slice(1).join(' '),
        phone: '',
        preferredChannel: 'national',
        language: 'fr',
        currency: 'DZD',
        twoFactorEnabled: false,
        notifications: {
          orderConfirmations: true,
          shipments: true,
          newAvailability: false,
          offers: false,
        },
      },
    };

    this.users.push(user);
    return user;
  }

  updatePassword(userId: string, passwordHash: string): AuthUser | undefined {
    const user = this.findById(userId);

    if (!user) {
      return undefined;
    }

    user.passwordHash = passwordHash;
    return user;
  }

  updateProfile(userId: string, updates: AuthProfileUpdates): AuthSessionUser | undefined {
    const user = this.findById(userId);

    if (!user) {
      return undefined;
    }

    user.profile = {
      ...user.profile,
      ...updates,
      notifications: {
        ...user.profile.notifications,
        ...updates.notifications,
      },
    };
    return this.stripPassword(user);
  }

  toSessionUser(user: AuthUser): AuthSessionUser {
    return this.stripPassword(user);
  }

  private stripPassword(user: AuthUser): AuthSessionUser {
    const { passwordHash, ...sessionUser } = user;
    return sessionUser;
  }
}
