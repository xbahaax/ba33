import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BreedDetectionResultDto } from './dto/breed-response.dto';
import { DetectBreedDto } from './dto/detect-breed.dto';
import { SheepAiService } from './sheep-ai.service';

@ApiTags('sheep-ai')
@Controller('sheep-ai')
export class SheepAiController {
  constructor(private readonly sheepAiService: SheepAiService) {}

  @Post('detect-breed')
  @ApiOperation({ summary: 'Detect the probable ram breed from an uploaded image.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        provider: { type: 'string', enum: ['gemini', 'local'] },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 200, type: BreedDetectionResultDto })
  @UseInterceptors(FileInterceptor('file'))
  detectBreed(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: DetectBreedDto,
  ) {
    return this.sheepAiService.detectBreed(file, body.provider);
  }
}
