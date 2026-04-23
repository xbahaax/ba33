import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsyncService } from './sync.service';

@ApiTags('sync')
@Controller('sync')
export class UsyncController {
  constructor(private readonly syncService: UsyncService) {}
}
