import { Injectable, NotFoundException } from '@nestjs/common';
import { SourcesRepository } from './sources.repository';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SourcesService {
  constructor(private readonly sourcesRepository: SourcesRepository) {}

  async createSource(data: {
    sourceType: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    name: string;
    contactPhone?: string;
    contactEmail?: string;
    regionId: string;
    latitude?: string;
    longitude?: string;
    address?: string;
    registeredBy?: string;
    notes?: string;
    shepherdDetails?: {
      hasSmartphone: boolean;
      preferredLanguage?: string;
      flockSizeEstimate?: number;
      typicalYieldKgPerYear?: string;
    };
    slaughterhouseDetails?: {
      licenseNumber: string;
      dailyCapacityHeads?: number;
      hasColdStorage: boolean;
    };
    aggregatorDetails?: {
      businessRegistration: string;
      registeredUpstreamCount?: number;
      premiumCertified?: boolean;
    };
  }) {
    const sourceId = uuid();

    const source = await this.sourcesRepository.create({
      id: sourceId,
      sourceType: data.sourceType,
      name: data.name,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      regionId: data.regionId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      registeredBy: data.registeredBy,
      notes: data.notes,
    });

    if (data.sourceType === 'c1_shepherd' && data.shepherdDetails) {
      await this.sourcesRepository.createShepherd(
        sourceId,
        data.shepherdDetails,
      );
    } else if (
      data.sourceType === 'c2_slaughterhouse' &&
      data.slaughterhouseDetails
    ) {
      await this.sourcesRepository.createSlaughterhouse(
        sourceId,
        data.slaughterhouseDetails,
      );
    } else if (
      data.sourceType === 'c3_aggregator' &&
      data.aggregatorDetails
    ) {
      await this.sourcesRepository.createAggregator(
        sourceId,
        data.aggregatorDetails,
      );
    }

    return this.getSource(sourceId);
  }

  async getSource(id: string) {
    const source = await this.sourcesRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`Source ${id} not found`);
    }

    let details = null;

    if (source.sourceType === 'c1_shepherd') {
      details = await this.sourcesRepository.findShepherdDetails(id);
    } else if (source.sourceType === 'c2_slaughterhouse') {
      details = await this.sourcesRepository.findSlaughterhouseDetails(id);
    } else if (source.sourceType === 'c3_aggregator') {
      details = await this.sourcesRepository.findAggregatorDetails(id);
    }

    return {
      ...source,
      details: details ?? null,
    };
  }

  async listSources(filters?: {
    type?: 'c1_shepherd' | 'c2_slaughterhouse' | 'c3_aggregator';
    regionId?: string;
    status?: 'pending' | 'active' | 'suspended';
  }) {
    return this.sourcesRepository.findAll(filters);
  }

  async updateSource(
    id: string,
    data: Partial<{
      name: string;
      contactPhone: string;
      contactEmail: string;
      regionId: string;
      latitude: string;
      longitude: string;
      address: string;
      status: 'pending' | 'active' | 'suspended';
      notes: string;
    }>,
  ) {
    const source = await this.sourcesRepository.findById(id);
    if (!source) {
      throw new NotFoundException(`Source ${id} not found`);
    }
    return this.sourcesRepository.update(id, data);
  }

  async listShepherds(regionId?: string) {
    return this.sourcesRepository.findAll({
      type: 'c1_shepherd',
      regionId,
    });
  }

  async listSlaughterhouses(regionId?: string) {
    return this.sourcesRepository.findAll({
      type: 'c2_slaughterhouse',
      regionId,
    });
  }
}
