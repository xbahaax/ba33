import { IsIn, IsOptional, IsString } from 'class-validator';

export class AdvanceOrderDto {
  @IsIn(['confirm', 'mark_paid', 'ship', 'deliver'])
  action!: 'confirm' | 'mark_paid' | 'ship' | 'deliver';

  @IsOptional()
  @IsString()
  trackingReference?: string;
}
