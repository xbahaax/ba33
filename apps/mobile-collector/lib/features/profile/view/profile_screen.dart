import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/lot_repository_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider);
    final lots = ref.watch(lotRepositoryProvider);
    final colors = Theme.of(context).ba33;

    if (user == null) return const SizedBox.shrink();

    final totalWeight =
        lots.fold<double>(0, (sum, lot) => sum + lot.weight);
    final urgentCount = lots.where((l) => l.isUrgent).length;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Profile',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          children: [
            // Avatar + name
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
              user.name ?? 'Collector',
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
            const SizedBox(height: Ba33Spacing.spacing1),
            Ba33Badge(
              label: 'Region ${user.regionId}',
              variant: Ba33BadgeVariant.outline,
            ),

            const SizedBox(height: Ba33Spacing.spacing8),

            // Stats
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.inventory_2_rounded,
                    value: '${lots.length}',
                    label: 'Lots',
                    color: colors.primary,
                  ),
                ),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: _StatCard(
                    icon: Icons.scale_rounded,
                    value: '${totalWeight.toStringAsFixed(1)} kg',
                    label: 'Total Weight',
                    color: colors.chart2,
                  ),
                ),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: _StatCard(
                    icon: Icons.priority_high_rounded,
                    value: '$urgentCount',
                    label: 'Urgent',
                    color: colors.destructive,
                  ),
                ),
              ],
            ),

            const SizedBox(height: Ba33Spacing.spacing8),

            // Actions
            Ba33Card(
              child: Column(
                children: [
                  _ActionTile(
                    icon: Icons.sync_rounded,
                    label: 'Sync Data',
                    subtitle: 'Upload pending lots',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Sync started...'),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                  Divider(color: colors.border, height: 1),
                  _ActionTile(
                    icon: Icons.summarize_rounded,
                    label: 'End of Day Summary',
                    subtitle: 'Review today\'s collections',
                    onTap: () {
                      // TODO(BA33-030): End of day summary
                    },
                  ),
                  Divider(color: colors.border, height: 1),
                  _ActionTile(
                    icon: Icons.settings_rounded,
                    label: 'Settings',
                    subtitle: 'Language, theme, notifications',
                    onTap: () {
                      // TODO(BA33-031): Settings screen
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            Ba33Button(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              label: 'Sign out',
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
              fontSize: 16,
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

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return ListTile(
      leading: Icon(icon, color: colors.foreground),
      title: Text(label, style: Theme.of(context).textTheme.bodyLarge),
      subtitle: Text(
        subtitle,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: colors.mutedForeground,
            ),
      ),
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: colors.mutedForeground,
      ),
      onTap: onTap,
    );
  }
}
