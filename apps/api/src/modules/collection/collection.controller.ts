import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UcollectionService } from './collection.service';

@ApiTags('collection')
@Controller('collection')
export class UcollectionController {
  constructor(private readonly collectionService: UcollectionService) {}
}
