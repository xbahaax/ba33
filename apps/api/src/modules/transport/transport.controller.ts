import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UtransportService } from './transport.service';

@ApiTags('transport')
@Controller('transport')
export class UtransportController {
  constructor(private readonly transportService: UtransportService) {}
}
