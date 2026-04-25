import {
  BadRequestException,
  Inject,
  Injectable,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { BreedDetectionResultDto } from './dto/breed-response.dto';
import { BREED_PROVIDER } from './interfaces/breed-provider.interface';
import type { BreedProvider } from './interfaces/breed-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { LocalProvider } from './providers/local.provider';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const LOW_CONFIDENCE_THRESHOLD = 0.6;

const TRAIT_SYNONYMS: Record<string, Record<string, string>> = {
  hornShape: {
    curled: 'spiral',
    curly: 'spiral',
    spiral: 'spiral',
    curved: 'curved',
  },
  bodyProportion: {
    large: 'muscular',
    bulky: 'muscular',
    muscular: 'muscular',
    lean: 'lean',
  },
};

@Injectable()
export class SheepAiService {
  constructor(
    @Inject(BREED_PROVIDER) private readonly defaultProvider: BreedProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly localProvider: LocalProvider,
  ) {}

  async detectBreed(
    file: Express.Multer.File | undefined,
    requestedProvider?: 'gemini' | 'local',
  ): Promise<BreedDetectionResultDto> {
    this.validateImage(file);

    const provider = this.resolveProvider(requestedProvider);
    const result = await provider.detectBreed(file.buffer, file.mimetype);
    const normalized = this.normalizeResult(result, provider.name);

    if (normalized.confidence < LOW_CONFIDENCE_THRESHOLD) {
      return {
        ...normalized,
        predictedBreed: null,
        lowConfidence: true,
        message: 'Low confidence',
      };
    }

    return normalized;
  }

  private resolveProvider(requestedProvider?: 'gemini' | 'local'): BreedProvider {
    const providerName = requestedProvider || process.env.AI_PROVIDER || this.defaultProvider.name;

    if (providerName === 'local') {
      return this.localProvider;
    }

    return this.geminiProvider;
  }

  private validateImage(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Only jpg, jpeg, and png images are allowed.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new PayloadTooLargeException('Image exceeds the 5MB upload limit.');
    }
  }

  private normalizeResult(
    result: BreedDetectionResultDto,
    providerName: string,
  ): BreedDetectionResultDto {
    const traits = result.traits
      ? {
          ...result.traits,
          woolColor: this.normalizeToken(result.traits.woolColor),
          hornShape: this.normalizeMappedToken('hornShape', result.traits.hornShape),
          faceShape: this.normalizeToken(result.traits.faceShape),
          bodyProportion: this.normalizeMappedToken('bodyProportion', result.traits.bodyProportion),
          tailType: this.normalizeToken(result.traits.tailType),
          estimatedBodyMassKg: Math.round(result.traits.estimatedBodyMassKg),
        }
      : null;

    return {
      predictedBreed: result.predictedBreed?.trim() || null,
      confidence: Number(result.confidence.toFixed(2)),
      traits,
      provider: providerName,
      lowConfidence: result.lowConfidence,
      message: result.message,
    };
  }

  private normalizeMappedToken(group: string, value: string): string {
    const token = this.normalizeToken(value);
    return TRAIT_SYNONYMS[group]?.[token] ?? token;
  }

  private normalizeToken(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
