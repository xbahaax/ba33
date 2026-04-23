import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsalesService } from './sales.service';

@ApiTags('sales')
@Controller('sales')
export class UsalesController {
  constructor(private readonly salesService: UsalesService) {}
}
