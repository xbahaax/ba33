import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import type { UpdateUserAccessDto } from './dto/update-user-access.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getOverview() {
    return this.usersRepository.getOverview();
  }

  getAccessOverview() {
    return this.usersRepository.getAccessOverview();
  }

  updateAccess(userId: string, input: UpdateUserAccessDto) {
    return this.usersRepository.updateAccess(userId, input);
  }
}
