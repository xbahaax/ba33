import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { CertificationService } from './certification.service';

@ApiTags('certification')
@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  // Public endpoint — no auth required
  @Get('verify/:code')
  @ApiOperation({ summary: 'Public certificate verification by product code' })
  async verify(@Param('code') code: string) {
    return this.certificationService.verify(code);
  }

  @Post('certify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('central_admin')
  @ApiOperation({ summary: 'Certify a product (validates all gates)' })
  async certify(
    @Body() dto: { productId: string; productCode: string },
    @Req() req: any,
  ) {
    return this.certificationService.certifyProduct(
      dto.productId, dto.productCode, req.user.id,
    );
  }

  @Post('validate-gates')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('central_admin')
  @ApiOperation({ summary: 'Check gate validation status without issuing' })
  async validateGates(
    @Body() dto: { productId: string; productCode: string },
  ) {
    return this.certificationService.validateGates(dto.productId, dto.productCode);
  }

  @Patch(':id/revoke')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('central_admin')
  @ApiOperation({ summary: 'Revoke a certificate' })
  async revoke(
    @Param('id') id: string,
    @Body() dto: { reason: string },
    @Req() req: any,
  ) {
    return this.certificationService.revokeCertificate(id, dto.reason, req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get certification by ID' })
  async get(@Param('id') id: string) {
    return this.certificationService.getCertification(id);
  }

  @Get('product/:code')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get certification by product code' })
  async getByCode(@Param('code') code: string) {
    return this.certificationService.getByProductCode(code);
  }
}
