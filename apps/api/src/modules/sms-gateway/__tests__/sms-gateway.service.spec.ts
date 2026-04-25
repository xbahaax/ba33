import { describe, expect, it, vi } from 'vitest';
import { SmsGatewayService } from '../sms-gateway.service';

describe('SmsGatewayService', () => {
  it('matches source by phone, normalizes text, and emits an event', async () => {
    const smsGatewayRepository = {
      findSourceByPhone: vi.fn().mockResolvedValue({
        id: 'source-1',
        name: 'Shepherd One',
        sourceType: 'c1_shepherd',
        latitude: '35.1111111',
        longitude: '1.2222222',
      }),
      createMessage: vi.fn().mockResolvedValue({
        id: 'sms-1',
        geolocationProvided: true,
      }),
      findRecent: vi.fn(),
    };

    const eventsService = {
      emit: vi.fn().mockResolvedValue({}),
    };

    const smsProvider = {
      name: 'mock',
      parseInboundPayload: vi.fn(),
      validateWebhookSignature: vi.fn().mockReturnValue(true),
    };

    const service = new SmsGatewayService(
      smsProvider as never,
      smsGatewayRepository as never,
      eventsService as never,
    );

    const result = await service.ingestInboundMessage({
      from: '+213 555 12 34 56',
      message: ' RAM 25kg Ready in Tiaret ',
      latitude: 35.5,
      longitude: 1.2,
    });

    expect(smsGatewayRepository.findSourceByPhone).toHaveBeenCalledWith('+213555123456');
    expect(smsGatewayRepository.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        normalizedText: 'ram 25kg ready in tiaret',
        sourceId: 'source-1',
        geolocationProvided: true,
      }),
    );
    expect(eventsService.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'sms.inbound.received',
        aggregateType: 'sms_message',
        aggregateId: 'sms-1',
      }),
    );
    expect(result.sourceMatched).toBe(true);
    expect(result.matchedSource.id).toBe('source-1');
  });

  it('normalizes a provider webhook through the configured provider', async () => {
    const smsGatewayRepository = {
      findSourceByPhone: vi.fn().mockResolvedValue(null),
      createMessage: vi.fn().mockResolvedValue({
        id: 'sms-2',
        geolocationProvided: false,
      }),
      findRecent: vi.fn(),
    };

    const eventsService = {
      emit: vi.fn().mockResolvedValue({}),
    };

    const smsProvider = {
      name: 'twilio',
      parseInboundPayload: vi.fn().mockReturnValue({
        from: '+213555999999',
        message: 'Ram ready',
        providerMessageId: 'SM1',
      }),
      validateWebhookSignature: vi.fn().mockReturnValue(true),
    };

    const service = new SmsGatewayService(
      smsProvider as never,
      smsGatewayRepository as never,
      eventsService as never,
    );

    const result = await service.ingestProviderWebhook(
      { From: '+213555999999', Body: 'Ram ready' },
      'sig',
      'https://example.com/api/v1/sms-gateway/providers/twilio/webhook',
    );

    expect(smsProvider.validateWebhookSignature).toHaveBeenCalled();
    expect(smsProvider.parseInboundPayload).toHaveBeenCalled();
    expect(result.ingestionChannel).toBe('twilio');
  });
});
