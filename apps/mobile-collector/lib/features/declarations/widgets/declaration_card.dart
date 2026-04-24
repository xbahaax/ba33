import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';

class DeclarationCard extends StatelessWidget {
  const DeclarationCard({
    super.key,
    required this.declaration,
    this.onSchedule,
  });

  final Declaration declaration;
  final VoidCallback? onSchedule;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final isNew = declaration.status == DeclarationStatus.announced;

    return Ba33Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: ID + status
          Row(
            children: [
              Expanded(
                child: Text(
                  declaration.id,
                  style: Ba33Typography.mono(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: colors.foreground,
                  ),
                ),
              ),
              Ba33Badge(
                label: _statusLabel(declaration.status),
                variant: isNew
                    ? Ba33BadgeVariant.primary
                    : Ba33BadgeVariant.secondary,
              ),
            ],
          ),

          const SizedBox(height: Ba33Spacing.spacing3),

          // Shepherd + weight
          Row(
            children: [
              Icon(Icons.person_rounded,
                  size: 16, color: colors.mutedForeground),
              const SizedBox(width: 6),
              Text(
                'Shepherd ${declaration.shepherdId}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
          const SizedBox(height: Ba33Spacing.spacing2),
          Row(
            children: [
              Icon(Icons.scale, size: 16, color: colors.mutedForeground),
              const SizedBox(width: 6),
              Text(
                declaration.estimatedWeight != null
                    ? '~${declaration.estimatedWeight!.toStringAsFixed(0)} kg'
                    : _categoryLabel(declaration.weightCategory),
                style: Ba33Typography.mono(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: colors.foreground,
                ),
              ),
              const SizedBox(width: Ba33Spacing.spacing3),
              Ba33Badge(
                label: _categoryLabel(declaration.weightCategory),
                variant: Ba33BadgeVariant.outline,
              ),
            ],
          ),

          // Notes
          if (declaration.notes != null &&
              declaration.notes!.isNotEmpty) ...[
            const SizedBox(height: Ba33Spacing.spacing2),
            Text(
              declaration.notes!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: colors.mutedForeground,
                  ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          // Scheduled time
          if (declaration.pickupScheduledAt != null) ...[
            const SizedBox(height: Ba33Spacing.spacing2),
            Row(
              children: [
                Icon(Icons.schedule_rounded,
                    size: 14, color: colors.primary),
                const SizedBox(width: 4),
                Text(
                  'Pickup at ${_formatTime(declaration.pickupScheduledAt!)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: colors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ],

          const SizedBox(height: Ba33Spacing.spacing2),

          // Time + action
          Row(
            children: [
              Text(
                _formatTime(declaration.createdAt),
                style: Ba33Typography.mono(
                  fontSize: 11,
                  color: colors.mutedForeground,
                ),
              ),
              const Spacer(),
              if (isNew && onSchedule != null)
                Ba33Button(
                  onPressed: onSchedule,
                  label: 'Schedule',
                  icon: Icons.calendar_today_rounded,
                  size: Ba33ButtonSize.sm,
                  variant: Ba33ButtonVariant.outline,
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _statusLabel(DeclarationStatus status) => switch (status) {
        DeclarationStatus.announced => 'New',
        DeclarationStatus.scheduledPickup => 'Scheduled',
        DeclarationStatus.collected => 'Collected',
        DeclarationStatus.cancelled => 'Cancelled',
      };

  String _categoryLabel(WeightCategory cat) => switch (cat) {
        WeightCategory.oneSheep => '1 Sheep',
        WeightCategory.oneBag => '1 Bag',
        WeightCategory.smallPile => 'Small Pile',
        WeightCategory.largePile => 'Large Pile',
        WeightCategory.custom => 'Custom',
      };

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month} $h:$m';
  }
}
