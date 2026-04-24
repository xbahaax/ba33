import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import type { DevLoginDto } from './dto/dev-login.dto';
import {
  AuthProfileUpdates,
  AuthRepository,
  AuthSessionUser,
  DevPersona,
  OperationsSessionResponse,
} from './auth.repository';

export interface LoginInput {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  registrationNumber: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: AuthSessionUser;
}

export interface DevLoginResponse {
  accessToken: string;
  session: OperationsSessionResponse;
}

@Injectable()
export class AuthService {
  private static readonly TOKEN_TTL_SECONDS = 60 * 60 * 24;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<AuthResponse> {
    if (!input.email && !input.phone) {
      throw new BadRequestException('Email or phone login is required.');
    }

    // Try buyer first
    const buyerUser = input.email
      ? await this.authRepository.findBuyerByEmail(input.email)
      : input.phone
        ? await this.authRepository.findBuyerByPhone(input.phone)
        : undefined;

    if (buyerUser) {
      const isValid = await compare(input.password, buyerUser.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      await this.authRepository.touchLastLogin(buyerUser.id);
      const refreshedUser = (await this.authRepository.findBuyerById(buyerUser.id)) ?? buyerUser;
      return this.buildBuyerAuthResponse(this.authRepository.toSessionUser(refreshedUser));
    }

    // Fallback to operations user (collector, shepherd, transporter, etc.)
    const opsUser = input.email
      ? await this.authRepository.findOperationsUserByEmail(input.email)
      : input.phone
        ? await this.authRepository.findOperationsUserByPhone(input.phone)
        : undefined;

    if (!opsUser) {
      throw new NotFoundException('The current user no longer exists.');
    }

    const isValid = await compare(input.password, opsUser.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.authRepository.touchLastLogin(opsUser.id);
    const refreshedUser = (await this.authRepository.findOperationsUserById(opsUser.id)) ?? opsUser;
    const session = await this.authRepository.toOperationsSession(refreshedUser);

    return {
      accessToken: await this.signAccessToken({
        email: session.user.email,
        fullName: session.user.fullName,
        id: session.user.id,
        permissions: session.permissions,
        regionId: session.user.regionId,
        userType: session.user.userType,
      }),
      tokenType: 'Bearer',
      expiresInSeconds: AuthService.TOKEN_TTL_SECONDS,
      user: {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
        userType: session.user.userType,
        profile: null,
      },
    };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await this.authRepository.findBuyerByEmail(input.email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await hash(input.password, 10);
    const created = await this.authRepository.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      companyName: input.companyName,
      registrationNumber: input.registrationNumber,
    });

    return this.buildBuyerAuthResponse(this.authRepository.toSessionUser(created));
  }

  async getMe(userId: string): Promise<AuthSessionUser | OperationsSessionResponse> {
    const buyerUser = await this.authRepository.findBuyerById(userId);

    if (buyerUser) {
      return this.authRepository.toSessionUser(buyerUser);
    }

    const operationsUser = await this.authRepository.findOperationsUserById(userId);

    if (!operationsUser) {
      throw new UnauthorizedException('Invalid session');
    }

    return this.authRepository.toOperationsSession(operationsUser);
  }

  async getDevPersonas(): Promise<DevPersona[]> {
    return this.authRepository.listDevPersonas();
  }

  async devLogin(input: DevLoginDto): Promise<DevLoginResponse> {
    if (!input.email && !input.userId) {
      throw new BadRequestException('A dev persona email or userId is required.');
    }

    const user =
      (input.userId ? await this.authRepository.findOperationsUserById(input.userId) : undefined) ??
      (input.email ? await this.authRepository.findOperationsUserByEmail(input.email) : undefined);

    if (!user) {
      throw new UnauthorizedException('Dev persona not found.');
    }

    await this.authRepository.touchLastLogin(user.id);
    const refreshedUser = (await this.authRepository.findOperationsUserById(user.id)) ?? user;
    const session = await this.authRepository.toOperationsSession(refreshedUser);

    return {
      accessToken: await this.signAccessToken({
        email: session.user.email,
        fullName: session.user.fullName,
        id: session.user.id,
        permissions: session.permissions,
        regionId: session.user.regionId,
        userType: session.user.userType,
      }),
      session,
    };
  }

  async changePassword(userId: string, currentPassword: string, nextPassword: string): Promise<{ updated: true }> {
    const user = await this.authRepository.findBuyerById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    const validCurrentPassword = await compare(currentPassword, user.passwordHash);

    if (!validCurrentPassword) {
      throw new UnauthorizedException('Current password is invalid');
    }

    const passwordHash = await hash(nextPassword, 10);
    await this.authRepository.updatePassword(userId, passwordHash);
    return { updated: true };
  }

  async updateMyProfile(userId: string, updates: AuthProfileUpdates) {
    const updated = await this.authRepository.updateProfile(userId, updates);

    if (!updated) {
      throw new UnauthorizedException('Invalid session');
    }

    return updated;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const userId = payload.sub;

      // Re-issue tokens for the user
      const opsUser = await this.authRepository.findOperationsUserById(userId);
      if (opsUser) {
        const session = await this.authRepository.toOperationsSession(opsUser);
        const accessToken = await this.signAccessToken({
          email: session.user.email,
          fullName: session.user.fullName,
          id: session.user.id,
          permissions: session.permissions,
          regionId: session.user.regionId,
          userType: session.user.userType,
        });
        return { accessToken, refreshToken };
      }

      const buyerUser = await this.authRepository.findBuyerById(userId);
      if (buyerUser) {
        const sessionUser = this.authRepository.toSessionUser(buyerUser);
        const accessToken = await this.signAccessToken({
          email: sessionUser.email,
          fullName: sessionUser.fullName,
          id: sessionUser.id,
          userType: sessionUser.userType,
        });
        return { accessToken, refreshToken };
      }

      throw new UnauthorizedException('User not found');
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async signAccessToken(input: {
    id: string;
    email: string;
    userType: string;
    fullName?: string;
    regionId?: string | null;
    permissions?: string[];
  }): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: input.id,
        email: input.email,
        type: input.userType,
        fullName: input.fullName,
        regionId: input.regionId ?? null,
        permissions: input.permissions ?? [],
      },
      { expiresIn: `${AuthService.TOKEN_TTL_SECONDS}s` },
    );
  }

  private async buildBuyerAuthResponse(user: AuthSessionUser): Promise<AuthResponse> {
    return {
      accessToken: await this.signAccessToken({
        email: user.email,
        fullName: user.fullName,
        id: user.id,
        userType: user.userType,
      }),
      tokenType: 'Bearer',
      expiresInSeconds: AuthService.TOKEN_TTL_SECONDS,
      user,
    };
  }
}
