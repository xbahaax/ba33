import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UfilesService } from './files.service';

@ApiTags('files')
@Controller('files')
export class UfilesController {
  constructor(private readonly filesService: UfilesService) {}
}
