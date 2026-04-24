import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransformationService } from './transformation.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@ApiTags('transformation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transformation')
export class TransformationController {
  constructor(
    private readonly transformationService: TransformationService,
  ) {}

  // --- Transformers ---

  @Post('transformers')
  @ApiOperation({ summary: 'Create a transformer' })
  async createTransformer(
    @Body()
    body: {
      name: string;
      track: 'd3_textile' | 'd4_bio';
      regionId: string;
      address: string;
      dailyCapacityKg: string;
      managerId?: string;
    },
  ) {
    return this.transformationService.createTransformer(body);
  }

  @Get('transformers')
  @ApiOperation({ summary: 'List all transformers' })
  @ApiQuery({ name: 'track', required: false, enum: ['d3_textile', 'd4_bio'] })
  async listTransformers(
    @Query('track') track?: 'd3_textile' | 'd4_bio',
  ) {
    return this.transformationService.listTransformers(track);
  }

  @Get('transformers/:id')
  @ApiOperation({ summary: 'Get a transformer by ID' })
  async getTransformer(@Param('id') id: string) {
    return this.transformationService.getTransformer(id);
  }

  // --- BOMs ---

  @Post('boms')
  @ApiOperation({ summary: 'Create a Bill of Materials' })
  async createBom(
    @Body()
    body: {
      transformerId: string;
      productTypeCode: string;
      productName: string;
      inputWoolKgPerUnit: string;
      additives?: unknown;
      expectedYieldPercent: string;
      version: number;
    },
  ) {
    return this.transformationService.createBom(body);
  }

  @Get('boms')
  @ApiOperation({ summary: 'List BOMs for a transformer' })
  @ApiQuery({ name: 'transformerId', required: true })
  async listBoms(@Query('transformerId') transformerId: string) {
    return this.transformationService.listBoms(transformerId);
  }

  // --- Production Runs ---

  @Post('runs')
  @ApiOperation({ summary: 'Start a production run' })
  async startProductionRun(
    @Body()
    body: {
      transformerId: string;
      bomId: string;
      lotIds: string[];
      operatedBy: string;
    },
  ) {
    return this.transformationService.startProductionRun(
      body.transformerId,
      body.bomId,
      body.lotIds,
      body.operatedBy,
    );
  }

  @Patch('runs/:id/complete')
  @ApiOperation({ summary: 'Complete a production run' })
  async completeProductionRun(
    @Param('id') id: string,
    @Body() body: { outputWeight: number; wasteWeight: number },
  ) {
    return this.transformationService.completeProductionRun(
      id,
      body.outputWeight,
      body.wasteWeight,
    );
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Get a production run with lots' })
  async getProductionRun(@Param('id') id: string) {
    return this.transformationService.getProductionRun(id);
  }

  @Get('runs')
  @ApiOperation({ summary: 'List production runs for a transformer' })
  @ApiQuery({ name: 'transformerId', required: true })
  async listProductionRuns(
    @Query('transformerId') transformerId: string,
  ) {
    return this.transformationService.listProductionRuns(transformerId);
  }

  // --- Products ---

  @Post('products')
  @ApiOperation({ summary: 'Create a product from a production run' })
  async createProduct(
    @Body()
    body: {
      runId: string;
      productTypeCode: string;
      quantity: string;
      unit: string;
      weightKg: string;
    },
  ) {
    return this.transformationService.createProduct(body.runId, {
      productTypeCode: body.productTypeCode,
      quantity: body.quantity,
      unit: body.unit,
      weightKg: body.weightKg,
    });
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get a product by ID' })
  async getProduct(@Param('id') id: string) {
    return this.transformationService.getProduct(id);
  }

  @Get('products')
  @ApiOperation({ summary: 'List products with optional filters' })
  @ApiQuery({ name: 'track', required: false, enum: ['d3_textile', 'd4_bio'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'productionRunId', required: false })
  async listProducts(
    @Query('track') track?: 'd3_textile' | 'd4_bio',
    @Query('status') status?: string,
    @Query('productionRunId') productionRunId?: string,
  ) {
    return this.transformationService.listProducts({
      track,
      status,
      productionRunId,
    });
  }

  // --- Waste ---

  @Post('waste')
  @ApiOperation({ summary: 'Record waste from a production or washing run' })
  async recordWaste(
    @Body()
    body: {
      productionRunId?: string;
      washingRunId?: string;
      amountKg: string;
      category: 'reusable' | 'recoverable' | 'disposal';
      destination?: string;
      recordedBy: string;
    },
  ) {
    return this.transformationService.recordWaste(body);
  }

  @Get('waste')
  @ApiOperation({ summary: 'List waste records for a production run' })
  @ApiQuery({ name: 'runId', required: true })
  async getWasteByRun(@Query('runId') runId: string) {
    return this.transformationService.getWasteByRun(runId);
  }
}
