import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { InboundSmsDto } from './dto/inbound-sms.dto';
import { InboundSmsResponseDto } from './dto/inbound-sms-response.dto';
import { SMS_PROVIDER } from './interfaces/sms-provider.interface';
import type { SmsProvider } from './interfaces/sms-provider.interface';
import { SmsGatewayRepository } from './sms-gateway.repository';

@Injectable()
export class SmsGatewayService {
  constructor(
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
    private readonly smsGatewayRepository: SmsGatewayRepository,
    private readonly eventsService: EventsService,
  ) {}

  ingestProviderWebhook(
    payload: Record<string, unknown>,
    signature?: string,
    requestUrl?: string,
  ): Promise<InboundSmsResponseDto> {
    if (!this.smsProvider.validateWebhookSignature(payload, signature, requestUrl)) {
      throw new ForbiddenException('Invalid SMS provider signature.');
    }

    const normalizedPayload = this.smsProvider.parseInboundPayload(payload);
    return this.ingestInboundMessage(normalizedPayload, this.smsProvider.name);
  }

  async ingestInboundMessage(
    input: InboundSmsDto,
    ingestionChannel = 'sms-gateway',
  ): Promise<InboundSmsResponseDto> {
    const senderPhone = this.normalizePhone(input.from);
    const normalizedText = this.normalizeMessage(input.message);
    const matchedSource = await this.smsGatewayRepository.findSourceByPhone(senderPhone);

    const persistedMessage = await this.smsGatewayRepository.createMessage({
      providerMessageId: input.providerMessageId,
      senderPhone,
      sourceId: matchedSource?.id,
      messageText: input.message,
      normalizedText,
      parsedPayload: {
        rawMessage: input.message,
        tokens: normalizedText.split(' '),
      },
      latitude: this.toDecimalString(input.latitude ?? Number(matchedSource?.latitude ?? NaN)),
      longitude: this.toDecimalString(input.longitude ?? Number(matchedSource?.longitude ?? NaN)),
      geolocationPrecisionMeters: input.geolocationPrecisionMeters,
      geolocationProvided:
        typeof input.latitude === 'number' && typeof input.longitude === 'number',
      sourceMatched: Boolean(matchedSource),
    });

    await this.eventsService.emit({
      eventType: 'sms.inbound.received',
      aggregateType: 'sms_message',
      aggregateId: persistedMessage.id,
      actorType: 'system',
      payload: {
        senderPhone,
        sourceId: matchedSource?.id ?? null,
        sourceMatched: Boolean(matchedSource),
        geolocationProvided:
          typeof input.latitude === 'number' && typeof input.longitude === 'number',
      },
      occurredAt: new Date(),
      version: 1,
      syncSource: ingestionChannel.replace(/-/g, '_'),
    });

    return {
      id: persistedMessage.id,
      accepted: true,
      sourceMatched: Boolean(matchedSource),
      matchedSource: {
        id: matchedSource?.id ?? null,
        name: matchedSource?.name ?? null,
        sourceType: matchedSource?.sourceType ?? null,
      },
      geolocationProvided: persistedMessage.geolocationProvided,
      ingestionChannel,
      normalizedText,
    };
  }

  listRecentMessages() {
    return this.smsGatewayRepository.findRecent();
  }

  private normalizePhone(value: string): string {
    return value.replace(/\s+/g, '').trim();
  }

  private normalizeMessage(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private toDecimalString(value: number): string | null {
    if (!Number.isFinite(value)) {
      return null;
    }

    return value.toFixed(7);
  }
}
