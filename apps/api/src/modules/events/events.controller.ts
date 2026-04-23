import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UeventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class UeventsController {
  constructor(private readonly eventsService: UeventsService) {}
}
