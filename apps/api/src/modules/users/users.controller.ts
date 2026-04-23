import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UusersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UusersController {
  constructor(private readonly usersService: UusersService) {}
}
