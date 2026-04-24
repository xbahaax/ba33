import 'package:flutter/material.dart';

import '../theme/ba33_spacing.dart';
import '../theme/ba33_theme.dart';

/// A centered empty-state placeholder.
class Ba33EmptyState extends StatelessWidget {
  const Ba33EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Ba33Spacing.spacing8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: colors.mutedForeground),
            const SizedBox(height: Ba33Spacing.spacing4),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                subtitle!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: colors.mutedForeground,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: Ba33Spacing.spacing6),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
