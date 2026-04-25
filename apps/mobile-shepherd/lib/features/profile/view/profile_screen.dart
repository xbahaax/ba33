import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/profession_provider.dart';

/// Simple profile / settings screen.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;
    final user = ref.watch(authProvider);
    final profession = ref.watch(professionProvider).value;

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
              icon: Icons.work_outline_rounded,
              title: 'المهنة',
              subtitle: profession?.labelArabic() ?? '— ما اخترتش',
              colors: colors,
              onTap: () => context.push('/profile/profession'),
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            _SettingsTile(
              icon: Icons.language,
              title: 'اللغة',
              subtitle: 'عربي / دارجة',
              colors: colors,
              onTap: () => _showLanguagePicker(context, colors),
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            _SettingsTile(
              icon: Icons.notifications_outlined,
              title: 'الإشعارات',
              subtitle: 'مفعلة',
              colors: colors,
              onTap: () => _showNotificationSettings(context, colors),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: () => _confirmLogout(context, ref, colors),
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

void _showLanguagePicker(BuildContext context, Ba33Colors colors) {
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
            'اختار اللغة',
            style: Theme.of(ctx).textTheme.titleLarge,
          ),
          const SizedBox(height: Ba33Spacing.spacing4),
          ListTile(
            leading: const Text('🇩🇿', style: TextStyle(fontSize: 24)),
            title: const Text('دارجة'),
            trailing: Icon(Icons.check_circle, color: colors.primary),
            shape: RoundedRectangleBorder(
              borderRadius: Ba33Radii.borderRadiusLg,
            ),
            onTap: () => Navigator.of(ctx).pop(),
          ),
          ListTile(
            leading: const Text('🇸🇦', style: TextStyle(fontSize: 24)),
            title: const Text('العربية الفصحى'),
            shape: RoundedRectangleBorder(
              borderRadius: Ba33Radii.borderRadiusLg,
            ),
            onTap: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('اللغة العربية الفصحى قريبا'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
          ListTile(
            leading: const Text('🇫🇷', style: TextStyle(fontSize: 24)),
            title: const Text('Français'),
            shape: RoundedRectangleBorder(
              borderRadius: Ba33Radii.borderRadiusLg,
            ),
            onTap: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Français bientôt disponible'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
          ),
          const SizedBox(height: Ba33Spacing.spacing4),
        ],
      ),
    ),
  );
}

void _showNotificationSettings(BuildContext context, Ba33Colors colors) {
  showModalBottomSheet(
    context: context,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) {
        return Padding(
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
                'الإشعارات',
                style: Theme.of(ctx).textTheme.titleLarge,
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              SwitchListTile.adaptive(
                title: const Text('إشعارات الجمع'),
                subtitle: Text(
                  'كي يجي الجامع',
                  style: TextStyle(color: colors.mutedForeground),
                ),
                value: true,
                activeTrackColor: colors.primary,
                onChanged: (_) {},
              ),
              SwitchListTile.adaptive(
                title: const Text('تحديثات الوصل'),
                subtitle: Text(
                  'حالة الصوف',
                  style: TextStyle(color: colors.mutedForeground),
                ),
                value: true,
                activeTrackColor: colors.primary,
                onChanged: (_) {},
              ),
              SwitchListTile.adaptive(
                title: const Text('تنبيهات عامة'),
                subtitle: Text(
                  'أخبار المنصة',
                  style: TextStyle(color: colors.mutedForeground),
                ),
                value: false,
                activeTrackColor: colors.primary,
                onChanged: (_) {},
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
            ],
          ),
        );
      },
    ),
  );
}

void _confirmLogout(
    BuildContext context, WidgetRef ref, Ba33Colors colors) {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('تأكيد الخروج'),
      content: const Text('واش راك متأكد تخرج؟'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(),
          child: const Text('إلغاء'),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.of(ctx).pop();
            ref.read(authProvider.notifier).logout();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: colors.destructive,
            foregroundColor: colors.destructiveForeground,
          ),
          child: const Text('خروج'),
        ),
      ],
    ),
  );
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
