import { Body, Controller, Get, Headers, Post, Req } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InboundSmsDto } from './dto/inbound-sms.dto';
import { InboundSmsResponseDto } from './dto/inbound-sms-response.dto';
import { SmsGatewayService } from './sms-gateway.service';
import { TwilioWebhookDto } from './dto/twilio-webhook.dto';

@ApiTags('sms-gateway')
@Controller('sms-gateway')
export class SmsGatewayController {
  constructor(private readonly smsGatewayService: SmsGatewayService) {}

  @Post('inbound')
  @ApiOperation({
    summary: 'Receive an inbound SMS, resolve the sender against known sources, and persist it.',
  })
  @ApiBody({ type: InboundSmsDto })
  @ApiResponse({ status: 201, type: InboundSmsResponseDto })
  receiveInboundSms(@Body() body: InboundSmsDto) {
    return this.smsGatewayService.ingestInboundMessage(body);
  }

  @Post('providers/twilio/webhook')
  @ApiOperation({
    summary: 'Receive a Twilio webhook and normalize it into the SMS gateway flow.',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: TwilioWebhookDto })
  @ApiResponse({ status: 201, type: InboundSmsResponseDto })
  receiveTwilioWebhook(
    @Body() body: TwilioWebhookDto,
    @Headers('x-twilio-signature') signature: string | undefined,
    @Req() request: { protocol: string; get(name: string): string | undefined; originalUrl: string },
  ) {
    const host = request.get('host');
    const requestUrl = host ? `${request.protocol}://${host}${request.originalUrl}` : undefined;

    return this.smsGatewayService.ingestProviderWebhook(body as Record<string, unknown>, signature, requestUrl);
  }

  @Get('recent')
  @ApiOperation({ summary: 'List recently received SMS messages.' })
  listRecentMessages() {
    return this.smsGatewayService.listRecentMessages();
  }
}
