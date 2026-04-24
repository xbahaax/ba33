import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { AuthProfileUpdates, AuthRepository, AuthSessionUser } from './auth.repository';

export interface LoginInput {
  email: string;
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

@Injectable()
export class AuthService {
  private static readonly TOKEN_TTL_SECONDS = 60 * 60 * 24;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundException('The current user no longer exists.');
    }

    const isValid = await compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(this.authRepository.toSessionUser(user));
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await this.authRepository.findByEmail(input.email);

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

    return this.buildAuthResponse(this.authRepository.toSessionUser(created));
  }

  async getMe(userId: string): Promise<AuthSessionUser> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    return this.authRepository.toSessionUser(user);
  }

  async changePassword(userId: string, currentPassword: string, nextPassword: string): Promise<{ updated: true }> {
    const user = await this.authRepository.findById(userId);

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

  private async signAccessToken(user: AuthSessionUser): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: user.userType,
      },
      { expiresIn: `${AuthService.TOKEN_TTL_SECONDS}s` },
    );
  }

  private async buildAuthResponse(user: AuthSessionUser): Promise<AuthResponse> {
    return {
      accessToken: await this.signAccessToken(user),
      tokenType: 'Bearer',
      expiresInSeconds: AuthService.TOKEN_TTL_SECONDS,
      user,
    };
  }
}
