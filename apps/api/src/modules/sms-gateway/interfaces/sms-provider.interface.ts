import type { InboundSmsDto } from '../dto/inbound-sms.dto';

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export interface SmsProvider {
  readonly name: string;
  parseInboundPayload(payload: Record<string, unknown>): InboundSmsDto;
  validateWebhookSignature(
    payload: Record<string, unknown>,
    signature?: string,
    requestUrl?: string,
  ): boolean;
}
