import { Injectable } from '@nestjs/common';
import { RulesRepository } from './rules.repository';
import type { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RulesService {
  constructor(private readonly rulesRepository: RulesRepository) {}

  getOverview() {
    return this.rulesRepository.getOverview();
  }

  versionRule(ruleId: string, input: UpdateRuleDto, actorId: string) {
    return this.rulesRepository.versionRule(ruleId, input, actorId);
  }
}
