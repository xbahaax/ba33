import 'package:flutter/material.dart';

import '../theme/ba33_radii.dart';
import '../theme/ba33_spacing.dart';
import '../theme/ba33_theme.dart';

/// Badge variant.
enum Ba33BadgeVariant { primary, secondary, destructive, outline }

/// ba33 design-system badge / chip.
class Ba33Badge extends StatelessWidget {
  const Ba33Badge({
    super.key,
    required this.label,
    this.variant = Ba33BadgeVariant.secondary,
    this.icon,
  });

  final String label;
  final Ba33BadgeVariant variant;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    final (bg, fg, border) = switch (variant) {
      Ba33BadgeVariant.primary => (colors.primary, colors.primaryForeground, colors.primary),
      Ba33BadgeVariant.secondary => (colors.secondary, colors.secondaryForeground, colors.secondary),
      Ba33BadgeVariant.destructive => (colors.destructive, colors.destructiveForeground, colors.destructive),
      Ba33BadgeVariant.outline => (Colors.transparent, colors.foreground, colors.border),
    };

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Ba33Spacing.spacing2,
        vertical: Ba33Spacing.spacing1,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: Ba33Radii.borderRadiusFull,
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ),
    );
  }
}
