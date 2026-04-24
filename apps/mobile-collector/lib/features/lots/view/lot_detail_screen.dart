import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers/lot_repository_provider.dart';

class LotDetailScreen extends ConsumerWidget {
  const LotDetailScreen({super.key, required this.lotId});

  final String lotId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lots = ref.watch(lotRepositoryProvider);
    final lot = lots.where((l) => l.id == lotId).firstOrNull;
    final colors = Theme.of(context).ba33;

    if (lot == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Lot')),
        body: const Ba33EmptyState(
          icon: Icons.error_outline,
          title: 'Lot not found',
          subtitle: 'This lot may have been removed',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Lot Details',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ID
            Ba33Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Lot ID',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: colors.mutedForeground,
                        ),
                  ),
                  const SizedBox(height: Ba33Spacing.spacing1),
                  Text(
                    lot.id,
                    style: Ba33Typography.mono(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: colors.foreground,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: Ba33Spacing.spacing4),

            // Status + Urgency
            Row(
              children: [
                Ba33Badge(
                  label: _statusLabel(lot.status),
                  variant: Ba33BadgeVariant.primary,
                ),
                const SizedBox(width: Ba33Spacing.spacing2),
                if (lot.isUrgent)
                  const Ba33Badge(
                    label: 'URGENT',
                    variant: Ba33BadgeVariant.destructive,
                    icon: Icons.priority_high,
                  ),
              ],
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            // Weight
            _DetailSection(
              icon: Icons.scale_rounded,
              title: 'Weight',
              value: '${lot.weight.toStringAsFixed(1)} kg',
              colors: colors,
              mono: true,
            ),

            const SizedBox(height: Ba33Spacing.spacing4),

            // Source Type
            _DetailSection(
              icon: Icons.person_rounded,
              title: 'Source Type',
              value: _sourceLabel(lot.sourceType),
              colors: colors,
            ),

            const SizedBox(height: Ba33Spacing.spacing4),

            // Wool State
            _DetailSection(
              icon: Icons.grass_rounded,
              title: 'Wool State',
              value: _woolLabel(lot.woolState),
              colors: colors,
            ),

            const SizedBox(height: Ba33Spacing.spacing4),

            // Location
            _DetailSection(
              icon: Icons.location_on_rounded,
              title: 'GPS Location',
              value:
                  '${lot.latitude.toStringAsFixed(4)}, ${lot.longitude.toStringAsFixed(4)}',
              colors: colors,
              mono: true,
            ),

            const SizedBox(height: Ba33Spacing.spacing4),

            // Created at
            _DetailSection(
              icon: Icons.access_time_rounded,
              title: 'Created',
              value: _formatDateTime(lot.createdAt),
              colors: colors,
              mono: true,
            ),

            // Notes
            if (lot.notes != null && lot.notes!.isNotEmpty) ...[
              const SizedBox(height: Ba33Spacing.spacing4),
              _DetailSection(
                icon: Icons.notes_rounded,
                title: 'Notes',
                value: lot.notes!,
                colors: colors,
              ),
            ],

            const SizedBox(height: Ba33Spacing.spacing8),
          ],
        ),
      ),
    );
  }

  String _statusLabel(LotStatus status) => switch (status) {
        LotStatus.announced => 'Announced',
        LotStatus.collected => 'Collected',
        LotStatus.inTransit => 'In Transit',
        LotStatus.receivedDepot => 'Received at Depot',
        LotStatus.preSorted => 'Pre-Sorted',
        LotStatus.dispatched => 'Dispatched',
        LotStatus.receivedLaverie => 'Received at Laverie',
        LotStatus.washing => 'Washing',
        LotStatus.washed => 'Washed',
        LotStatus.qualified => 'Qualified',
        LotStatus.dispatchedTransformer => 'Dispatched to Transformer',
        LotStatus.inTransformation => 'In Transformation',
        LotStatus.transformed => 'Transformed',
        LotStatus.certified => 'Certified',
        LotStatus.forSale => 'For Sale',
        LotStatus.sold => 'Sold',
        LotStatus.rejected => 'Rejected',
        LotStatus.quarantined => 'Quarantined',
      };

  String _sourceLabel(SourceType type) => switch (type) {
        SourceType.c1 => 'C1 Shepherd',
        SourceType.c2 => 'C2 Slaughterhouse',
        SourceType.c3 => 'C3 Aggregator',
      };

  String _woolLabel(WoolState ws) => switch (ws) {
        WoolState.clean => 'Clean',
        WoolState.dirty => 'Dirty',
        WoolState.veryDirty => 'Very Dirty',
        WoolState.contaminated => 'Contaminated',
        WoolState.withMeat => 'With Meat',
      };

  String _formatDateTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month}/${dt.year} $h:$m';
  }
}

class _DetailSection extends StatelessWidget {
  const _DetailSection({
    required this.icon,
    required this.title,
    required this.value,
    required this.colors,
    this.mono = false,
  });

  final IconData icon;
  final String title;
  final String value;
  final Ba33Colors colors;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    return Ba33Card(
      child: Row(
        children: [
          Icon(icon, size: 20, color: colors.mutedForeground),
          const SizedBox(width: Ba33Spacing.spacing3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: colors.mutedForeground,
                      ),
                ),
                const SizedBox(height: Ba33Spacing.spacing1),
                mono
                    ? Text(
                        value,
                        style: Ba33Typography.mono(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: colors.foreground,
                        ),
                      )
                    : Text(
                        value,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
