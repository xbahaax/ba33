import { Injectable } from '@nestjs/common';
import type { InboundSmsDto } from '../dto/inbound-sms.dto';
import type { SmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  readonly name = 'mock';

  parseInboundPayload(payload: Record<string, unknown>): InboundSmsDto {
    return {
      from: String(payload.from ?? ''),
      message: String(payload.message ?? ''),
      providerMessageId:
        typeof payload.providerMessageId === 'string' ? payload.providerMessageId : undefined,
      latitude: this.toNumber(payload.latitude),
      longitude: this.toNumber(payload.longitude),
      geolocationPrecisionMeters: this.toNumber(payload.geolocationPrecisionMeters),
    };
  }

  validateWebhookSignature(): boolean {
    return true;
  }

  private toNumber(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
