import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Displays a single lot summary in the list.
class LotCard extends StatelessWidget {
  const LotCard({super.key, required this.lot});

  final Lot lot;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return GestureDetector(
      onTap: () => context.push('/lots/${Uri.encodeComponent(lot.id)}'),
      child: Ba33Card(
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: ID + urgency
          Row(
            children: [
              Expanded(
                child: Text(
                  lot.id,
                  style: Ba33Typography.mono(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: colors.foreground,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (lot.isUrgent)
                const Ba33Badge(
                  label: 'URGENT',
                  variant: Ba33BadgeVariant.destructive,
                  icon: Icons.priority_high,
                ),
            ],
          ),

          const SizedBox(height: Ba33Spacing.spacing3),

          // Weight
          Row(
            children: [
              Icon(Icons.scale, size: 16, color: colors.mutedForeground),
              const SizedBox(width: 6),
              Text(
                '${lot.weight.toStringAsFixed(1)} kg',
                style: Ba33Typography.mono(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: colors.foreground,
                ),
              ),
            ],
          ),

          const SizedBox(height: Ba33Spacing.spacing2),

          // Badges (wrapped to avoid overflow)
          Wrap(
            spacing: Ba33Spacing.spacing2,
            runSpacing: Ba33Spacing.spacing1,
            children: [
              Ba33Badge(
                label: _sourceLabel(lot.sourceType),
                variant: Ba33BadgeVariant.outline,
              ),
              Ba33Badge(
                label: _woolLabel(lot.woolState),
              ),
            ],
          ),

          // Notes if present
          if (lot.notes != null && lot.notes!.isNotEmpty) ...[
            const SizedBox(height: Ba33Spacing.spacing2),
            Text(
              lot.notes!,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: colors.mutedForeground,
                  ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          const SizedBox(height: Ba33Spacing.spacing2),

          // Timestamp
          Text(
            _formatTime(lot.createdAt),
            style: Ba33Typography.mono(
              fontSize: 11,
              color: colors.mutedForeground,
            ),
          ),
        ],
      ),
      ),
    );
  }

  String _sourceLabel(SourceType type) => switch (type) {
        SourceType.c1 => 'C1 Shepherd',
        SourceType.c2 => 'C2 Slaughter',
        SourceType.c3 => 'C3 Aggregator',
      };

  String _woolLabel(WoolState ws) => switch (ws) {
        WoolState.clean => 'Clean',
        WoolState.dirty => 'Dirty',
        WoolState.veryDirty => 'Very Dirty',
        WoolState.contaminated => 'Contaminated',
        WoolState.withMeat => 'With Meat',
      };

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month}/${dt.year} $h:$m';
  }
}
