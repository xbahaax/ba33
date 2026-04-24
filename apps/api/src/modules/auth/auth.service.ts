import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(password: string, email?: string, phone?: string) {
    if (!email && !phone) {
      throw new UnauthorizedException('Email or phone is required');
    }

    const user = phone
      ? await this.authRepository.findUserByPhone(phone)
      : await this.authRepository.findUserByEmail(email!);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, type: user.userType };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, tokenType: 'refresh' },
      { expiresIn: '7d' },
    );

    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createSession(
      user.id,
      refreshTokenHash,
      null,
      expiresAt,
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    let decoded: { sub: string; email: string; type: string };
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const session =
      await this.authRepository.findSessionByToken(refreshTokenHash);
    if (!session) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    if (new Date() > session.expiresAt) {
      await this.authRepository.revokeSession(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke the old session (token rotation)
    await this.authRepository.revokeSession(session.id);

    const user = await this.authRepository.findUserById(decoded.sub);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload = { sub: user.id, email: user.email, type: user.userType };

    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(
      { ...payload, tokenType: 'refresh' },
      { expiresIn: '7d' },
    );

    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.createSession(
      user.id,
      newRefreshTokenHash,
      null,
      expiresAt,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...profile } = user;
    return profile;
  }
}
