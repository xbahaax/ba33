# SMS Gateway Module

Standalone NestJS module for ingesting inbound SMS messages from shepherds or other source actors.

## Goal

Accept SMS traffic from a provider webhook, store each inbound message, resolve the sender by phone number against known `sources`, preserve geolocation when available, and emit an append-only event for traceability.

## Current shape

- Endpoint: `POST /api/v1/sms-gateway/inbound`
- Provider webhook endpoint: `POST /api/v1/sms-gateway/providers/twilio/webhook`
- Optional listing endpoint: `GET /api/v1/sms-gateway/recent`
- Input: sender phone, raw message text, optional provider message ID, optional latitude/longitude
- Persistence: `sms_messages`
- Matching key: `sources.contact_phone`

## Design rules

- SMS provider logic stays at the module boundary.
- Sender resolution happens in the service, not in the controller.
- Source matching uses the canonical `sources` table, not a duplicated contact table.
- Geolocation can come from the SMS provider payload or fall back to the source record.
- The module emits an `sms.inbound.received` event after persistence.
- Provider selection is environment-driven through a provider contract.

## Environment variables

```env
SMS_GATEWAY_PROVIDER=twilio
SMS_GATEWAY_SHARED_SECRET=change-me
TWILIO_AUTH_TOKEN=change-me
TWILIO_ACCOUNT_SID=change-me
TWILIO_PHONE_NUMBER=+213000000000
```

## Integration note

The module is scaffolded but not wired into `src/app.module.ts` yet. Import `SmsGatewayModule` only after contract validation and webhook-provider selection are complete.
