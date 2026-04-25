import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';
import type { BreedDetectionResultDto } from '../dto/breed-response.dto';
import type { BreedProvider } from '../interfaces/breed-provider.interface';

const geminiResponseSchema = z.object({
  predictedBreed: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  traits: z
    .object({
      woolColor: z.string(),
      hornShape: z.string(),
      faceShape: z.string(),
      bodyProportion: z.string(),
      tailType: z.string(),
      estimatedBodyMassKg: z.number().nonnegative(),
    })
    .nullable(),
});

@Injectable()
export class GeminiProvider implements BreedProvider {
  readonly name = 'gemini';

  async detectBreed(image: Buffer, mimeType: string): Promise<BreedDetectionResultDto> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new ServiceUnavailableException('GEMINI_API_KEY is not configured.');
    }

    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const endpoint =
      process.env.GEMINI_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: [
                  'Analyze the uploaded ram sheep image.',
                  'Extract:',
                  '- wool color',
                  '- horn shape',
                  '- face shape',
                  '- body proportion',
                  '- tail type',
                  '- estimated body mass in kilograms',
                  '- probable breed',
                  'Return ONLY valid JSON using this schema:',
                  '{',
                  '  "predictedBreed": string | null,',
                  '  "confidence": number,',
                  '  "traits": {',
                  '    "woolColor": string,',
                  '    "hornShape": string,',
                  '    "faceShape": string,',
                  '    "bodyProportion": string,',
                  '    "tailType": string,',
                  '    "estimatedBodyMassKg": number',
                  '  } | null',
                  '}',
                  'Do not include markdown.',
                  'Do not include explanation.',
                  'Return JSON only.',
                ].join('\n'),
              },
              {
                inlineData: {
                  mimeType,
                  data: image.toString('base64'),
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`Gemini request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new InternalServerErrorException('Gemini returned an empty response.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new InternalServerErrorException('Gemini returned malformed JSON.');
    }

    const normalized = geminiResponseSchema.safeParse(parsed);
    if (!normalized.success) {
      throw new InternalServerErrorException('Gemini response does not match the expected schema.');
    }

    return {
      ...normalized.data,
      provider: this.name,
      lowConfidence: false,
      message: null,
    };
  }
}
