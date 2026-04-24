import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { RequirePermissions, CurrentUser } from '../../common/auth/decorators';
import { LotsService } from './lots.service';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { AddPhotoDto } from './dto/add-photo.dto';
import { AddSignatureDto } from './dto/add-signature.dto';

@ApiTags('lots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @UseGuards(PermissionsGuard)
  @RequirePermissions('dashboard.view')
  @Get('summary')
  getSummary() {
    return this.lotsService.getSummary();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lot' })
  createLot(
    @Body() dto: CreateLotDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.lotsService.createLot(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List lots with optional filters' })
  @ApiQuery({ name: 'collectorId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sourceType', required: false })
  @ApiQuery({ name: 'isUrgent', required: false })
  listLots(
    @Query('collectorId') collectorId?: string,
    @Query('status') status?: string,
    @Query('sourceType') sourceType?: string,
    @Query('isUrgent') isUrgent?: string,
  ) {
    return this.lotsService.listLots({
      collectorId,
      status,
      sourceType: sourceType as any,
      isUrgent: isUrgent === 'true' ? true : isUrgent === 'false' ? false : undefined,
    });
  }

  @Get('qr/:code')
  @ApiOperation({ summary: 'Lookup lot by QR code' })
  @ApiParam({ name: 'code', description: 'QR code string' })
  lookupByQr(@Param('code') code: string) {
    return this.lotsService.lookupByQr(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single lot with photos, signatures, weighs' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  getLot(@Param('id') id: string) {
    return this.lotsService.getLot(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lot properties' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  updateLot(@Param('id') id: string, @Body() dto: UpdateLotDto) {
    return this.lotsService.updateLot(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lot status' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  updateLotStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.lotsService.updateLotStatus(id, body.status, userId);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Add a photo to a lot' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  addPhoto(@Param('id') id: string, @Body() dto: AddPhotoDto) {
    return this.lotsService.addPhoto(id, dto.fileId, dto.angle, dto.gpsLat, dto.gpsLng);
  }

  @Post(':id/signatures')
  @ApiOperation({ summary: 'Add a signature to a lot' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  addSignature(@Param('id') id: string, @Body() dto: AddSignatureDto) {
    return this.lotsService.addSignature(id, dto.type, dto.fileId, dto.signedByName);
  }
}
