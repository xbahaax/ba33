import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers/auth_provider.dart';
import '../../jobs/view_model/jobs_view_model.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider);
    final jobsState = ref.watch(jobsViewModelProvider);
    final colors = Theme.of(context).ba33;

    if (user == null) return const SizedBox.shrink();

    final openJobs = jobsState.value?.length ?? 0;
    final urgentJobs =
        jobsState.value?.where((j) => j.isUrgent).length ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Profil',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          children: [
            const SizedBox(height: Ba33Spacing.spacing4),
            CircleAvatar(
              radius: 40,
              backgroundColor: colors.primary,
              child: Text(
                (user.name ?? 'C')[0].toUpperCase(),
                style: Ba33Typography.serif(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: colors.primaryForeground,
                ),
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
            Text(
              user.name ?? 'Collecteur',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: Ba33Spacing.spacing1),
            Text(
              user.phone,
              style: Ba33Typography.mono(
                fontSize: 14,
                color: colors.mutedForeground,
              ),
            ),

            const SizedBox(height: Ba33Spacing.spacing8),

            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.assignment_outlined,
                    value: '$openJobs',
                    label: 'Missions ouvertes',
                    color: colors.primary,
                  ),
                ),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: _StatCard(
                    icon: Icons.priority_high_rounded,
                    value: '$urgentJobs',
                    label: 'Urgentes',
                    color: colors.destructive,
                  ),
                ),
              ],
            ),

            const SizedBox(height: Ba33Spacing.spacing8),

            Ba33Button(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              label: 'Se déconnecter',
              icon: Icons.logout_rounded,
              variant: Ba33ButtonVariant.destructive,
              expand: true,
            ),

            const SizedBox(height: Ba33Spacing.spacing8),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Ba33Card(
      padding: const EdgeInsets.all(Ba33Spacing.spacing3),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: Ba33Spacing.spacing2),
          Text(
            value,
            style: Ba33Typography.mono(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: colors.foreground,
            ),
          ),
          const SizedBox(height: Ba33Spacing.spacing1),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: colors.mutedForeground,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
