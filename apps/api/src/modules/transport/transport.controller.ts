import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransportService } from './transport.service';

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}
}
