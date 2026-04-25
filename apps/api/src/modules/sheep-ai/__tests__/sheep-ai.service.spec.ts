import { describe, expect, it } from 'vitest';
import { SheepAiService } from '../sheep-ai.service';
import { GeminiProvider } from '../providers/gemini.provider';
import { LocalProvider } from '../providers/local.provider';

describe('SheepAiService', () => {
  it('normalizes synonyms and low-confidence responses', async () => {
    const geminiProvider = {
      name: 'gemini',
      detectBreed: async () => ({
        predictedBreed: 'Hamra',
        confidence: 0.42,
        traits: {
          woolColor: ' White ',
          hornShape: 'Curled',
          faceShape: ' Long ',
          bodyProportion: 'Large',
          tailType: ' Thin ',
          estimatedBodyMassKg: 81.7,
        },
        provider: 'gemini',
        lowConfidence: false,
        message: null,
      }),
    } as unknown as GeminiProvider;

    const localProvider = {
      name: 'local',
      detectBreed: async () => {
        throw new Error('not used');
      },
    } as unknown as LocalProvider;

    const service = new SheepAiService(geminiProvider, geminiProvider, localProvider);

    const result = await service.detectBreed({
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 100,
    } as Express.Multer.File);

    expect(result.predictedBreed).toBeNull();
    expect(result.lowConfidence).toBe(true);
    expect(result.message).toBe('Low confidence');
    expect(result.traits).toEqual({
      woolColor: 'white',
      hornShape: 'spiral',
      faceShape: 'long',
      bodyProportion: 'muscular',
      tailType: 'thin',
      estimatedBodyMassKg: 82,
    });
  });
});
