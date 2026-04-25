import { ApiProperty } from '@nestjs/swagger';

export class SheepTraitsDto {
  @ApiProperty({ example: 'white' })
  woolColor!: string;

  @ApiProperty({ example: 'spiral' })
  hornShape!: string;

  @ApiProperty({ example: 'long' })
  faceShape!: string;

  @ApiProperty({ example: 'muscular' })
  bodyProportion!: string;

  @ApiProperty({ example: 'thin' })
  tailType!: string;

  @ApiProperty({ example: 82 })
  estimatedBodyMassKg!: number;
}

export class BreedDetectionResultDto {
  @ApiProperty({ example: 'Ouled Djellal', nullable: true })
  predictedBreed!: string | null;

  @ApiProperty({ example: 0.86, minimum: 0, maximum: 1 })
  confidence!: number;

  @ApiProperty({ type: SheepTraitsDto, nullable: true })
  traits!: SheepTraitsDto | null;

  @ApiProperty({ example: 'gemini' })
  provider!: string;

  @ApiProperty({ example: false })
  lowConfidence!: boolean;

  @ApiProperty({ example: null, nullable: true })
  message!: string | null;
}
