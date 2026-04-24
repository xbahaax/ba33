import 'package:ba33_domain/ba33_domain.dart';
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
                    onTap: () => _showEndOfDaySummary(
                        context, lots, totalWeight, urgentCount),
                  ),
                  Divider(color: colors.border, height: 1),
                  _ActionTile(
                    icon: Icons.settings_rounded,
                    label: 'Settings',
                    subtitle: 'Language, theme, notifications',
                    onTap: () => _showSettings(context),
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

void _showEndOfDaySummary(
  BuildContext context,
  List<Lot> lots,
  double totalWeight,
  int urgentCount,
) {
  final colors = Theme.of(context).ba33;
  final today = DateTime.now();
  final todayLots = lots.where((l) =>
      l.createdAt.year == today.year &&
      l.createdAt.month == today.month &&
      l.createdAt.day == today.day);
  final todayWeight =
      todayLots.fold<double>(0, (sum, lot) => sum + lot.weight);

  showModalBottomSheet(
    context: context,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (ctx) => Padding(
      padding: const EdgeInsets.all(Ba33Spacing.spacing6),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: colors.border,
                borderRadius: Ba33Radii.borderRadiusFull,
              ),
            ),
          ),
          const SizedBox(height: Ba33Spacing.spacing6),
          Text(
            'End of Day Summary',
            style: Theme.of(ctx).textTheme.titleLarge,
          ),
          const SizedBox(height: Ba33Spacing.spacing2),
          Text(
            '${today.day}/${today.month}/${today.year}',
            style: Ba33Typography.mono(
              fontSize: 13,
              color: colors.mutedForeground,
            ),
          ),
          const SizedBox(height: Ba33Spacing.spacing6),
          _SummaryRow(
            label: 'Lots collected today',
            value: '${todayLots.length}',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing3),
          _SummaryRow(
            label: 'Weight today',
            value: '${todayWeight.toStringAsFixed(1)} kg',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing3),
          _SummaryRow(
            label: 'Total lots (all time)',
            value: '${lots.length}',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing3),
          _SummaryRow(
            label: 'Total weight (all time)',
            value: '${totalWeight.toStringAsFixed(1)} kg',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing3),
          _SummaryRow(
            label: 'Urgent lots',
            value: '$urgentCount',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing8),
        ],
      ),
    ),
  );
}

void _showSettings(BuildContext context) {
  final colors = Theme.of(context).ba33;

  showModalBottomSheet(
    context: context,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (ctx) => Padding(
      padding: const EdgeInsets.all(Ba33Spacing.spacing6),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: colors.border,
                borderRadius: Ba33Radii.borderRadiusFull,
              ),
            ),
          ),
          const SizedBox(height: Ba33Spacing.spacing6),
          Text(
            'Settings',
            style: Theme.of(ctx).textTheme.titleLarge,
          ),
          const SizedBox(height: Ba33Spacing.spacing6),
          ListTile(
            leading: Icon(Icons.language, color: colors.foreground),
            title: const Text('Language'),
            subtitle: Text(
              'English',
              style: TextStyle(color: colors.mutedForeground),
            ),
            trailing: Icon(
              Icons.chevron_right_rounded,
              color: colors.mutedForeground,
            ),
            onTap: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Language selection coming soon'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
          Divider(color: colors.border, height: 1),
          ListTile(
            leading:
                Icon(Icons.dark_mode_rounded, color: colors.foreground),
            title: const Text('Theme'),
            subtitle: Text(
              'System default',
              style: TextStyle(color: colors.mutedForeground),
            ),
            trailing: Icon(
              Icons.chevron_right_rounded,
              color: colors.mutedForeground,
            ),
            onTap: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Theme selection coming soon'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
          Divider(color: colors.border, height: 1),
          ListTile(
            leading: Icon(Icons.notifications_outlined,
                color: colors.foreground),
            title: const Text('Notifications'),
            subtitle: Text(
              'Enabled',
              style: TextStyle(color: colors.mutedForeground),
            ),
            trailing: Icon(
              Icons.chevron_right_rounded,
              color: colors.mutedForeground,
            ),
            onTap: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Notification settings coming soon'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
          const SizedBox(height: Ba33Spacing.spacing6),
        ],
      ),
    ),
  );
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    required this.colors,
  });

  final String label;
  final String value;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: colors.mutedForeground,
              ),
        ),
        Text(
          value,
          style: Ba33Typography.mono(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: colors.foreground,
          ),
        ),
      ],
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
