import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@ApiTags('sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new source (shepherd, slaughterhouse, or aggregator)' })
  async create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.createSource(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sources with optional filters' })
  @ApiQuery({ name: 'type', required: false, enum: ['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator'] })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'active', 'suspended'] })
  async findAll(
    @Query('type') type?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator',
    @Query('regionId') regionId?: string,
    @Query('status') status?: 'pending' | 'active' | 'suspended',
  ) {
    return this.sourcesService.listSources({ type, regionId, status });
  }

  @Get('shepherds')
  @ApiOperation({ summary: 'List all shepherds (for collector census)' })
  @ApiQuery({ name: 'regionId', required: false })
  async listShepherds(@Query('regionId') regionId?: string) {
    return this.sourcesService.listShepherds(regionId);
  }

  @Get('slaughterhouses')
  @ApiOperation({ summary: 'List all slaughterhouses' })
  @ApiQuery({ name: 'regionId', required: false })
  async listSlaughterhouses(@Query('regionId') regionId?: string) {
    return this.sourcesService.listSlaughterhouses(regionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get source with type-specific details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.getSource(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a source' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSourceDto,
  ) {
    return this.sourcesService.updateSource(id, dto);
  }
}
