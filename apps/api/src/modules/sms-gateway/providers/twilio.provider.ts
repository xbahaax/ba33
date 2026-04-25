import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { InboundSmsDto } from '../dto/inbound-sms.dto';
import type { SmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class TwilioProvider implements SmsProvider {
  readonly name = 'twilio';

  parseInboundPayload(payload: Record<string, unknown>): InboundSmsDto {
    return {
      from: String(payload.From ?? ''),
      message: String(payload.Body ?? ''),
      providerMessageId:
        typeof payload.MessageSid === 'string' ? payload.MessageSid : undefined,
      latitude: this.toNumber(payload.Latitude),
      longitude: this.toNumber(payload.Longitude),
      geolocationPrecisionMeters: undefined,
    };
  }

  validateWebhookSignature(
    payload: Record<string, unknown>,
    signature?: string,
    requestUrl?: string,
  ): boolean {
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!authToken || !signature || !requestUrl) {
      return false;
    }

    const sortedEntries = Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([left], [right]) => left.localeCompare(right));

    const data = sortedEntries.reduce((buffer, [key, value]) => `${buffer}${key}${String(value)}`, requestUrl);
    const expected = createHmac('sha1', authToken).update(data).digest('base64');

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  private toNumber(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
