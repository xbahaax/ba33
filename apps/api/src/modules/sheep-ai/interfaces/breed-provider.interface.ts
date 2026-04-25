import type { BreedDetectionResultDto } from '../dto/breed-response.dto';

export const BREED_PROVIDER = Symbol('BREED_PROVIDER');

export interface BreedProvider {
  readonly name: string;
  detectBreed(image: Buffer, mimeType: string): Promise<BreedDetectionResultDto>;
}
