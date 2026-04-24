import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { RulesRepository } from './rules.repository';
import { v4 as uuid } from 'uuid';

const DEFAULT_RULES: Array<{
  key: string;
  value: unknown;
  description: string;
}> = [
  {
    key: 'a1.depot_weight_threshold_percent',
    value: 85,
    description: 'Depot capacity percentage that triggers an A1 alert',
  },
  {
    key: 'a1.depot_urgent_count_threshold',
    value: 5,
    description: 'Number of urgent lots in depot that triggers an A1 alert',
  },
  {
    key: 's2s3.d3_min_grade',
    value: 'B',
    description: 'Minimum grade required for D3 textile dispatch',
  },
  {
    key: 's2s3.d3_min_fiber_length_mm',
    value: 50,
    description: 'Minimum fiber length in mm required for D3 textile dispatch',
  },
  {
    key: 'pricing.urgency_discount_percent',
    value: 15,
    description: 'Discount percentage applied to urgent (C2) lots',
  },
  {
    key: 'pricing.c2_safety_premium_percent',
    value: -10,
    description: 'Safety premium adjustment for C2 source lots',
  },
  {
    key: 'reconciliation.tolerance_percent',
    value: 2,
    description: 'Weight reconciliation tolerance percentage between declared and actual',
  },
  {
    key: 'cert.required_gates',
    value: [
      'e1_passed',
      's1_passed',
      'r1_within_range',
      's2_dispatched',
      'ex_sx_cleared',
      'no_open_anomalies',
    ],
    description: 'Gates that must be passed before certification',
  },
  {
    key: 'sla.c2_pickup_hours',
    value: 4,
    description: 'SLA hours for C2 (urgent/slaughterhouse) lot pickup',
  },
  {
    key: 'sla.c1_pickup_hours',
    value: 72,
    description: 'SLA hours for C1 (shepherd) lot pickup',
  },
];

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(private readonly rulesRepository: RulesRepository) {}

  async getRule(key: string) {
    const rule = await this.rulesRepository.findByKey(key);
    if (!rule) {
      throw new NotFoundException(`Rule with key "${key}" not found`);
    }
    return rule;
  }

  async getRuleValue<T>(key: string): Promise<T> {
    const rule = await this.getRule(key);
    return rule.value as T;
  }

  async listRules() {
    return this.rulesRepository.findAll();
  }

  async setRule(key: string, value: unknown, description?: string, userId?: string) {
    const existing = await this.rulesRepository.findByKey(key);
    const now = new Date();

    if (existing) {
      // Expire the old rule
      await this.rulesRepository.update(existing.id, { effectiveTo: now });
    }

    const newVersion = existing?.version ? existing.version + 1 : 1;

    return this.rulesRepository.create({
      id: uuid(),
      ruleKey: key,
      value,
      description: description ?? existing?.description ?? undefined,
      version: newVersion,
      effectiveFrom: now,
      createdBy: userId ?? '00000000-0000-0000-0000-000000000000',
    });
  }

  async seedDefaults() {
    const seeded: string[] = [];

    for (const rule of DEFAULT_RULES) {
      const existing = await this.rulesRepository.findByKey(rule.key);
      if (!existing) {
        await this.rulesRepository.create({
          id: uuid(),
          ruleKey: rule.key,
          value: rule.value,
          description: rule.description,
          version: 1,
          effectiveFrom: new Date(),
          createdBy: '00000000-0000-0000-0000-000000000000',
        });
        seeded.push(rule.key);
      }
    }

    this.logger.log(`Seeded ${seeded.length} default rules: ${seeded.join(', ') || 'none (all exist)'}`);
    return { seeded, total: DEFAULT_RULES.length };
  }
}
