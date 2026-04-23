import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransformationService } from './transformation.service';

@ApiTags('transformation')
@Controller('transformation')
export class TransformationController {
  constructor(private readonly transformationService: TransformationService) {}
}
