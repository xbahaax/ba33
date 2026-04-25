import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../view_model/jobs_view_model.dart';
import '../widgets/job_card.dart';

class JobListScreen extends ConsumerWidget {
  const JobListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(jobsViewModelProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Collectes',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () =>
                ref.read(jobsViewModelProvider.notifier).refresh(),
          ),
        ],
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Ba33EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Échec du chargement',
          subtitle: e.toString(),
          action: Ba33Button(
            onPressed: () =>
                ref.read(jobsViewModelProvider.notifier).refresh(),
            label: 'Réessayer',
            icon: Icons.refresh_rounded,
          ),
        ),
        data: (jobs) {
          if (jobs.isEmpty) {
            return const Ba33EmptyState(
              icon: Icons.inbox_outlined,
              title: 'Aucune instruction',
              subtitle:
                  'Les missions de collecte du dépôt apparaîtront ici',
            );
          }

          final urgent = jobs.where((j) => j.isUrgent).toList();
          final normal = jobs.where((j) => !j.isUrgent).toList();

          return RefreshIndicator(
            onRefresh: () =>
                ref.read(jobsViewModelProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              children: [
                if (urgent.isNotEmpty) ...[
                  _SectionHeader(title: 'Urgent', count: urgent.length),
                  const SizedBox(height: Ba33Spacing.spacing2),
                  ...urgent.map((j) => Padding(
                        padding: const EdgeInsets.only(
                            bottom: Ba33Spacing.spacing3),
                        child: JobCard(job: j),
                      )),
                  const SizedBox(height: Ba33Spacing.spacing4),
                ],
                if (normal.isNotEmpty) ...[
                  _SectionHeader(title: 'À faire', count: normal.length),
                  const SizedBox(height: Ba33Spacing.spacing2),
                  ...normal.map((j) => Padding(
                        padding: const EdgeInsets.only(
                            bottom: Ba33Spacing.spacing3),
                        child: JobCard(job: j),
                      )),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.count});

  final String title;
  final int count;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: colors.mutedForeground,
              ),
        ),
        const SizedBox(width: Ba33Spacing.spacing2),
        Ba33Badge(
          label: '$count',
          variant: Ba33BadgeVariant.primary,
        ),
      ],
    );
  }
}

