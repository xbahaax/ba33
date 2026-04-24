import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { getDefaultPermissionsForUserType, mergePermissions } from '../../common/auth/rbac';
import type { DevLoginDto } from './dto/dev-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async loginDev(input: DevLoginDto) {
    const candidate =
      input.userId
        ? await this.authRepository.findUserById(input.userId)
        : input.email
          ? await this.authRepository.findUserByEmail(input.email)
          : await this.authRepository.findUserByEmail('admin@ba33.local');

    if (!candidate) {
      throw new NotFoundException('No matching development persona was found.');
    }

    if (candidate.status !== 'active') {
      throw new UnauthorizedException('The selected user is not active.');
    }

    const session = this.buildSession(candidate);

    return {
      accessToken: this.jwtService.sign({
        sub: session.user.id,
        email: session.user.email,
        type: session.user.userType,
        fullName: session.user.fullName,
        regionId: session.user.regionId,
        permissions: session.permissions,
      }),
      session,
    };
  }

  async getCurrentSession(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('The current user no longer exists.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('The current user is not active.');
    }

    return this.buildSession(user);
  }

  async listPersonas() {
    return this.authRepository.listInternalPersonas();
  }

  private buildSession(user: Awaited<ReturnType<AuthRepository['findUserById']>>) {
    if (!user) {
      throw new UnauthorizedException('Unable to build a session.');
    }

    const assignedPermissions = user.assignedRoles.flatMap((role) => role.permissions);
    const effectivePermissions = mergePermissions(
      getDefaultPermissionsForUserType(user.userType),
      assignedPermissions,
    );

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
      assignedRoles: user.assignedRoles,
      hasWebOperationsAccess: effectivePermissions.length > 0,
    };
  }
}
