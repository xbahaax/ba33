import { ApiProperty } from '@nestjs/swagger';

export class SmsMatchedSourceDto {
  @ApiProperty({ example: '3f1b6709-f2c3-4dd2-a1b1-8fb3e7d3bc7a', nullable: true })
  id!: string | null;

  @ApiProperty({ example: 'Mohamed Ben Salah', nullable: true })
  name!: string | null;

  @ApiProperty({ example: 'c1_shepherd', nullable: true })
  sourceType!: string | null;
}

export class InboundSmsResponseDto {
  @ApiProperty({ example: '7b3e5e8d-0f86-4a61-b3d8-3e4d6ebd6d48' })
  id!: string;

  @ApiProperty({ example: true })
  accepted!: boolean;

  @ApiProperty({ example: true })
  sourceMatched!: boolean;

  @ApiProperty({ type: SmsMatchedSourceDto })
  matchedSource!: SmsMatchedSourceDto;

  @ApiProperty({ example: true })
  geolocationProvided!: boolean;

  @ApiProperty({ example: 'sms-gateway' })
  ingestionChannel!: string;

  @ApiProperty({ example: 'RAM 25kg ready in tiaret. lat 35.3711 lng 1.3162' })
  normalizedText!: string;
}
