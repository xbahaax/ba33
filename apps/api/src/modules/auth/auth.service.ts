import { Injectable } from '@nestjs/common';
import { UauthRepository } from './auth.repository';

@Injectable()
export class UauthService {
  constructor(private readonly authRepository: UauthRepository) {}
}
