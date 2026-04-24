import { IsIn } from 'class-validator';

export class UpdateA1AlertStatusDto {
  @IsIn(['open', 'acknowledged', 'resolved'])
  status!: 'open' | 'acknowledged' | 'resolved';
}
