import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto } from './dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('register')
  register(
    @Body()
    body: {
      email: string;
      password: string;
      fullName: string;
      companyName: string;
      registrationNumber: string;
    },
  ) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  updatePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword: string; nextPassword: string },
  ) {
    return this.authService.changePassword(userId, body.currentPassword, body.nextPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      companyName?: string;
      registrationNumber?: string;
      sector?: string;
      website?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      preferredChannel?: 'national' | 'export' | 'institutional';
      language?: 'fr' | 'ar' | 'en';
      currency?: 'DZD' | 'EUR' | 'USD';
      twoFactorEnabled?: boolean;
      notifications?: {
        orderConfirmations?: boolean;
        shipments?: boolean;
        newAvailability?: boolean;
        offers?: boolean;
      };
    },
  ) {
    return this.authService.updateMyProfile(userId, body);
  }

  @Post('logout')
  logout() {
    return { loggedOut: true };
  }
}
