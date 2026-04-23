import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsourcesService } from './sources.service';

@ApiTags('sources')
@Controller('sources')
export class UsourcesController {
  constructor(private readonly sourcesService: UsourcesService) {}
}
