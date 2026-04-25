import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../model/collection_job.dart';

/// Displays a single collection job (instruction) in the queue.
class JobCard extends StatelessWidget {
  const JobCard({super.key, required this.job});

  final CollectionJob job;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final source = job.source;
    final depot = job.depot;
    final preLot = job.preLot;

    return GestureDetector(
      onTap: () => context.push('/jobs/${Uri.encodeComponent(job.id)}'),
      child: Ba33Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: status + urgency
            Row(
              children: [
                Expanded(
                  child: Text(
                    source?.name ?? 'Source',
                    style: Theme.of(context).textTheme.titleSmall,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (job.isUrgent)
                  const Ba33Badge(
                    label: 'URGENT',
                    variant: Ba33BadgeVariant.destructive,
                    icon: Icons.priority_high,
                  ),
              ],
            ),

            const SizedBox(height: Ba33Spacing.spacing2),

            // From → To
            Row(
              children: [
                Icon(Icons.place_outlined,
                    size: 16, color: colors.mutedForeground),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    source?.address ?? 'Adresse non renseignée',
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.warehouse_outlined,
                    size: 16, color: colors.mutedForeground),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    depot?.name ?? 'Dépôt',
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const SizedBox(height: Ba33Spacing.spacing3),

            Wrap(
              spacing: Ba33Spacing.spacing2,
              runSpacing: Ba33Spacing.spacing1,
              children: [
                if (source?.profession != null)
                  Ba33Badge(
                    label: _professionLabel(source!.profession!),
                    variant: Ba33BadgeVariant.outline,
                  ),
                if (preLot != null)
                  Ba33Badge(
                    label: '${preLot.estimatedWeightKg.toStringAsFixed(0)} kg',
                  ),
                Ba33Badge(
                  label: _statusLabel(job.status),
                  variant: _statusVariant(job.status),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _professionLabel(String p) => switch (p) {
        'shepherd' => 'Éleveur',
        'slaughterhouse' => 'Abattoir',
        'butcher' => 'Boucher',
        'aggregator' => 'Agrégateur',
        _ => 'Autre',
      };

  String _statusLabel(CollectionJobStatus s) => switch (s) {
        CollectionJobStatus.pending => 'À assigner',
        CollectionJobStatus.assigned => 'Nouveau',
        CollectionJobStatus.accepted => 'Accepté',
        CollectionJobStatus.inProgress => 'En route',
        CollectionJobStatus.arrived => 'Arrivé',
        CollectionJobStatus.completed => 'Terminé',
        CollectionJobStatus.cancelled => 'Annulé',
      };

  Ba33BadgeVariant _statusVariant(CollectionJobStatus s) => switch (s) {
        CollectionJobStatus.pending ||
        CollectionJobStatus.assigned =>
          Ba33BadgeVariant.primary,
        CollectionJobStatus.inProgress ||
        CollectionJobStatus.arrived =>
          Ba33BadgeVariant.outline,
        CollectionJobStatus.accepted => Ba33BadgeVariant.outline,
        CollectionJobStatus.completed => Ba33BadgeVariant.outline,
        CollectionJobStatus.cancelled => Ba33BadgeVariant.destructive,
      };
}
