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

    const user = input.email
      ? await this.authRepository.findBuyerByEmail(input.email)
      : input.phone
        ? await this.authRepository.findBuyerByPhone(input.phone)
        : undefined;

    if (!user) {
      throw new NotFoundException('The current user no longer exists.');
    }

    const isValid = await compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.authRepository.touchLastLogin(user.id);
    const refreshedUser = (await this.authRepository.findBuyerById(user.id)) ?? user;
    return this.buildBuyerAuthResponse(this.authRepository.toSessionUser(refreshedUser));
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
