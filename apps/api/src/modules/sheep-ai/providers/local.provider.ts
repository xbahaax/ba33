import { Injectable, NotImplementedException } from '@nestjs/common';
import type { BreedDetectionResultDto } from '../dto/breed-response.dto';
import type { BreedProvider } from '../interfaces/breed-provider.interface';

@Injectable()
export class LocalProvider implements BreedProvider {
  readonly name = 'local';

  async detectBreed(_image: Buffer, _mimeType: string): Promise<BreedDetectionResultDto> {
    throw new NotImplementedException(
      'Local sheep breed detection is not implemented yet. later  we dont have good pc tht handle this hh.',
    );
  }
}
