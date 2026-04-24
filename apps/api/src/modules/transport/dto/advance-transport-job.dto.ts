import { IsIn } from 'class-validator';

export class AdvanceTransportJobDto {
  @IsIn(['accept', 'start', 'deliver'])
  action!: 'accept' | 'start' | 'deliver';
}
