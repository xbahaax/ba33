import { Injectable } from '@nestjs/common';
import { UusersRepository } from './users.repository';

@Injectable()
export class UusersService {
  constructor(private readonly usersRepository: UusersRepository) {}
}
