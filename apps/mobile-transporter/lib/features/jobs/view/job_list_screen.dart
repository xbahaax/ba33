import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../model/transport_job.dart';
import '../view_model/job_list_view_model.dart';
import '../../trip/view_model/active_trip_view_model.dart';
import '../../../shared/widgets/lane_badge.dart';
import '../../../shared/widgets/sla_countdown.dart';

class JobListScreen extends ConsumerWidget {
  const JobListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final jobsAsync = ref.watch(jobListProvider);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(
                Ba33Spacing.spacing6,
                Ba33Spacing.spacing6,
                Ba33Spacing.spacing6,
                Ba33Spacing.spacing4,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Bonjour, Mohamed',
                          style: textTheme.headlineSmall,
                        ),
                        Text(
                          'Missions du jour — 24 Avril 2026',
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () =>
                        ref.read(jobListProvider.notifier).refresh(),
                    icon: Icon(Icons.refresh, color: colors.mutedForeground),
                  ),
                ],
              ),
            ),

            // Job list
            Expanded(
              child: jobsAsync.when(
                loading: () => Center(
                  child: CircularProgressIndicator(color: colors.primary),
                ),
                error: (e, _) => Center(
                  child: Text(
                    'Erreur de chargement',
                    style: textTheme.bodyMedium
                        ?.copyWith(color: colors.destructive),
                  ),
                ),
                data: (jobs) {
                  final urgent =
                      jobs.where((j) => j.isUrgent).toList();
                  final normal =
                      jobs.where((j) => !j.isUrgent).toList();

                  return RefreshIndicator(
                    color: colors.primary,
                    onRefresh: () =>
                        ref.read(jobListProvider.notifier).refresh(),
                    child: ListView(
                      padding: const EdgeInsets.symmetric(
                        horizontal: Ba33Spacing.spacing4,
                      ),
                      children: [
                        if (urgent.isNotEmpty) ...[
                          _SectionHeader(
                            label: 'URGENT',
                            color: colors.destructive,
                            count: urgent.length,
                          ),
                          ...urgent.map(
                            (job) => _JobCard(
                              job: job,
                              onTap: () {
                                ref
                                    .read(activeTripProvider.notifier)
                                    .startJob(job);
                                context.push('/job-detail');
                              },
                            ),
                          ),
                          const SizedBox(height: Ba33Spacing.spacing4),
                        ],
                        if (normal.isNotEmpty) ...[
                          _SectionHeader(
                            label: 'ASSIGNÉS',
                            color: colors.mutedForeground,
                            count: normal.length,
                          ),
                          ...normal.map(
                            (job) => _JobCard(
                              job: job,
                              onTap: () {
                                ref
                                    .read(activeTripProvider.notifier)
                                    .startJob(job);
                                context.push('/job-detail');
                              },
                            ),
                          ),
                        ],
                        const SizedBox(height: Ba33Spacing.spacing8),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.label,
    required this.color,
    required this.count,
  });

  final String label;
  final Color color;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        Ba33Spacing.spacing2,
        Ba33Spacing.spacing2,
        Ba33Spacing.spacing2,
        Ba33Spacing.spacing3,
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 14,
            decoration: BoxDecoration(
              color: color,
              borderRadius: Ba33Radii.borderRadiusFull,
            ),
          ),
          const SizedBox(width: Ba33Spacing.spacing2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
              color: color,
            ),
          ),
          const SizedBox(width: Ba33Spacing.spacing2),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 6,
              vertical: 2,
            ),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: Ba33Radii.borderRadiusFull,
            ),
            child: Text(
              '$count',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job, required this.onTap});

  final TransportJob job;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: Ba33Spacing.spacing3),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: Ba33Radii.borderRadiusLg,
          border: Border.all(
            color: job.isUrgent
                ? colors.destructive.withOpacity(0.4)
                : colors.border,
          ),
          boxShadow: job.isUrgent ? Ba33Shadows.shadowSm : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  LaneBadge(lane: job.lane),
                  const Spacer(),
                  if (job.slaDeadline != null)
                    SlaCountdown(deadline: job.slaDeadline!),
                ],
              ),
              const SizedBox(height: Ba33Spacing.spacing3),

              // Route
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _locationIcon(job.originType),
                          style: const TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          job.originName,
                          style: textTheme.titleSmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          job.originType.toUpperCase(),
                          style: textTheme.labelSmall
                              ?.copyWith(color: colors.mutedForeground),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: Ba33Spacing.spacing3),
                    child: Icon(Icons.arrow_forward,
                        color: colors.mutedForeground, size: 20),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          _locationIcon(job.destinationType),
                          style: const TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          job.destinationName,
                          style: textTheme.titleSmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.end,
                        ),
                        Text(
                          job.destinationType.toUpperCase(),
                          style: textTheme.labelSmall
                              ?.copyWith(color: colors.mutedForeground),
                          textAlign: TextAlign.end,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              Divider(color: colors.border, height: 1),
              const SizedBox(height: Ba33Spacing.spacing3),

              // Stats row
              Row(
                children: [
                  _Stat(
                    icon: Icons.inventory_2_outlined,
                    label: '${job.lots.length} lots',
                    colors: colors,
                  ),
                  const SizedBox(width: Ba33Spacing.spacing4),
                  _Stat(
                    icon: Icons.scale_outlined,
                    label:
                        '${job.totalDeclaredWeight.toStringAsFixed(1)} kg',
                    mono: true,
                    colors: colors,
                  ),
                  const Spacer(),
                  Icon(
                    Icons.chevron_right,
                    color: colors.mutedForeground,
                    size: 20,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _locationIcon(String type) {
    switch (type) {
      case 'depot':
        return '🏭';
      case 'laverie':
        return '🫧';
      case 'source':
        return '🐑';
      case 'transformer':
        return '🏗️';
      default:
        return '📍';
    }
  }
}

class _Stat extends StatelessWidget {
  const _Stat({
    required this.icon,
    required this.label,
    required this.colors,
    this.mono = false,
  });

  final IconData icon;
  final String label;
  final Ba33Colors colors;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: colors.mutedForeground),
        const SizedBox(width: 4),
        mono
            ? Text(
                label,
                style: Ba33Typography.mono(
                  fontSize: 12,
                  color: colors.foreground,
                ),
              )
            : Text(
                label,
                style: Theme.of(context).textTheme.bodySmall,
              ),
      ],
    );
  }
}
