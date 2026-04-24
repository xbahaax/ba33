import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/providers/auth_provider.dart';

/// Simple profile / settings screen.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;
    final user = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('حسابي'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(Ba33Spacing.spacing6),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: colors.primary,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person,
                size: 40,
                color: colors.primaryForeground,
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
            Text(
              user?.name ?? 'راعي',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: Ba33Spacing.spacing1),
            Text(
              user?.phone ?? '',
              style: Ba33Typography.mono(
                fontSize: 14,
                color: colors.mutedForeground,
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing2),
            Text(
              'المنطقة: ${user?.regionId ?? '-'}',
              style: TextStyle(color: colors.mutedForeground),
            ),
            const SizedBox(height: Ba33Spacing.spacing8),
            _SettingsTile(
              icon: Icons.language,
              title: 'اللغة',
              subtitle: 'عربي / دارجة',
              colors: colors,
              onTap: () {
                // TODO(BA33-025): language picker
              },
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            _SettingsTile(
              icon: Icons.notifications_outlined,
              title: 'الإشعارات',
              subtitle: 'مفعلة',
              colors: colors,
              onTap: () {
                // TODO(BA33-026): notification settings
              },
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: colors.destructive,
                  side: BorderSide(color: colors.destructive),
                ),
                child: const Text('خروج'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.colors,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Ba33Colors colors;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: Ba33Radii.borderRadiusLg,
          border: Border.all(color: colors.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: colors.foreground),
            const SizedBox(width: Ba33Spacing.spacing3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(fontWeight: FontWeight.w500)),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: colors.mutedForeground,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_left, color: colors.mutedForeground),
          ],
        ),
      ),
    );
  }
}
