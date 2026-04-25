import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { SMS_PROVIDER } from './interfaces/sms-provider.interface';
import { MockSmsProvider } from './providers/mock.provider';
import { SmsGatewayController } from './sms-gateway.controller';
import { TwilioProvider } from './providers/twilio.provider';
import { SmsGatewayRepository } from './sms-gateway.repository';
import { SmsGatewayService } from './sms-gateway.service';

@Module({
  imports: [EventsModule],
  controllers: [SmsGatewayController],
  providers: [
    SmsGatewayRepository,
    SmsGatewayService,
    MockSmsProvider,
    TwilioProvider,
    {
      provide: SMS_PROVIDER,
      useFactory: (mockProvider: MockSmsProvider, twilioProvider: TwilioProvider) => {
        return process.env.SMS_GATEWAY_PROVIDER === 'twilio' ? twilioProvider : mockProvider;
      },
      inject: [MockSmsProvider, TwilioProvider],
    },
  ],
  exports: [SmsGatewayService],
})
export class SmsGatewayModule {}
