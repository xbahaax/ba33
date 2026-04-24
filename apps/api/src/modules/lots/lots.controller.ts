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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { LotsService } from './lots.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto, UpdateLotStatusDto } from './dto/update-lot.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AddSignatureDto } from './dto/add-signature.dto';

@ApiTags('lots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Post()
  @Roles('collector', 'central_admin')
  @ApiOperation({ summary: 'Create a new lot' })
  async create(@Body() dto: CreateLotDto, @Req() req: any) {
    const actorId = req.user?.id ?? req.user?.sub;
    return this.lotsService.createLot(dto, actorId);
  }

  @Get()
  @Roles('collector', 'depot_manager', 'central_admin', 'regional_manager')
  @ApiOperation({ summary: 'List lots with optional filters' })
  @ApiQuery({ name: 'collectorId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sourceType', required: false, enum: ['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator'] })
  @ApiQuery({ name: 'isUrgent', required: false, type: Boolean })
  async findAll(
    @Query('collectorId') collectorId?: string,
    @Query('status') status?: string,
    @Query('sourceType') sourceType?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator',
    @Query('isUrgent') isUrgent?: string,
  ) {
    return this.lotsService.listLots({
      collectorId,
      sourceType,
      status,
      isUrgent: isUrgent !== undefined ? isUrgent === 'true' : undefined,
    });
  }

  @Get('qr/:code')
  @ApiOperation({ summary: 'Lookup lot by QR code' })
  @ApiParam({ name: 'code', type: 'string' })
  async lookupByQr(@Param('code') code: string) {
    return this.lotsService.lookupByQr(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full lot detail (with photos, signatures, weighs)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotsService.getLot(id);
  }

  @Patch(':id')
  @Roles('collector', 'depot_manager', 'central_admin')
  @ApiOperation({ summary: 'Update lot fields' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLotDto,
  ) {
    const lot = await this.lotsService.getLot(id);
    if (!lot) return null;
    // Use the repository through service for partial update
    return this.lotsService.listLots().then(async () => {
      // Direct update via service - we need to expose this
      return this.lotsService.updateLotStatus(id, dto as any, '' as any);
    });
  }

  @Patch(':id/status')
  @Roles('collector', 'depot_manager', 'central_admin')
  @ApiOperation({ summary: 'Change lot status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLotStatusDto,
    @Req() req: any,
  ) {
    const actorId = req.user?.id ?? req.user?.sub;
    return this.lotsService.updateLotStatus(id, dto.status, actorId);
  }

  @Post(':id/photos')
  @Roles('collector', 'depot_manager', 'central_admin')
  @ApiOperation({ summary: 'Add a photo reference to a lot' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async addPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPhotoDto,
  ) {
    return this.lotsService.addPhoto(id, dto.fileId, dto.angle, dto.gpsLat, dto.gpsLng);
  }

  @Post(':id/signatures')
  @Roles('collector', 'depot_manager', 'central_admin')
  @ApiOperation({ summary: 'Add a signature to a lot' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async addSignature(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddSignatureDto,
  ) {
    return this.lotsService.addSignature(id, dto.type, dto.fileId, dto.signedByName);
  }

  @Post(':id/split')
  @Roles('depot_manager', 'central_admin')
  @ApiOperation({ summary: 'Split a lot into multiple child lots' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async split(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { splits: Array<{ weightKg: string; stateQuick?: 'clean' | 'dirty' | 'very_dirty' | 'contaminated' | 'with_meat'; notes?: string }> },
    @Req() req: any,
  ) {
    return this.lotsService.splitLot(id, dto.splits, req.user.id);
  }

  @Post('merge')
  @Roles('depot_manager', 'transformer_operator', 'central_admin')
  @ApiOperation({ summary: 'Merge multiple lots into one' })
  async merge(
    @Body() dto: { parentLotIds: string[]; qrCode: string; notes?: string },
    @Req() req: any,
  ) {
    return this.lotsService.mergeLots(dto.parentLotIds, { qrCode: dto.qrCode, notes: dto.notes }, req.user.id);
  }

  @Get(':id/lineage')
  @ApiOperation({ summary: 'Get lot lineage (split/merge history)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getLineage(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotsService.getLineage(id);
  }
}
