import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UtransformationService } from './transformation.service';

@ApiTags('transformation')
@Controller('transformation')
export class UtransformationController {
  constructor(private readonly transformationService: UtransformationService) {}
}
