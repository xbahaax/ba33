import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DevLoginDto } from './dto/dev-login.dto';
import { CurrentUser } from '../../common/auth/decorators';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('personas')
  getPersonas() {
    return this.authService.listPersonas();
  }

  @Post('dev-login')
  loginDev(@Body() input: DevLoginDto) {
    return this.authService.loginDev(input);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentSession(@CurrentUser('id') userId: string) {
    return this.authService.getCurrentSession(userId);
  }
}
