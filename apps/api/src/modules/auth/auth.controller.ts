import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UauthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class UauthController {
  constructor(private readonly authService: UauthService) {}
}
