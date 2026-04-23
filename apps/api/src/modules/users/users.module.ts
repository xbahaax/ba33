import { Module } from '@nestjs/common';
import { UusersController } from './users.controller';
import { UusersService } from './users.service';
import { UusersRepository } from './users.repository';

@Module({
  controllers: [UusersController],
  providers: [UusersService, UusersRepository],
  exports: [UusersService],
})
export class UusersModule {}
