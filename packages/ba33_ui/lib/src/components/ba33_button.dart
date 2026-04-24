import 'package:flutter/material.dart';

import '../theme/ba33_colors.dart';
import '../theme/ba33_radii.dart';
import '../theme/ba33_theme.dart';

/// Button variant matching the design system.
enum Ba33ButtonVariant { primary, secondary, outline, ghost, destructive }

/// Button size.
enum Ba33ButtonSize { sm, md, lg }

/// ba33 design-system button.
class Ba33Button extends StatelessWidget {
  const Ba33Button({
    super.key,
    required this.onPressed,
    required this.label,
    this.icon,
    this.variant = Ba33ButtonVariant.primary,
    this.size = Ba33ButtonSize.md,
    this.isLoading = false,
    this.expand = false,
  });

  final VoidCallback? onPressed;
  final String label;
  final IconData? icon;
  final Ba33ButtonVariant variant;
  final Ba33ButtonSize size;
  final bool isLoading;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final style = _buildStyle(colors);
    final padding = _padding;
    final textStyle = _textStyle(context);

    Widget child = isLoading
        ? SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: style.foregroundColor?.resolve({}),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: size == Ba33ButtonSize.sm ? 16 : 20),
                const SizedBox(width: 8),
              ],
              Text(label, style: textStyle),
            ],
          );

    final button = switch (variant) {
      Ba33ButtonVariant.primary || Ba33ButtonVariant.destructive => ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: style.copyWith(padding: WidgetStatePropertyAll(padding)),
          child: child,
        ),
      Ba33ButtonVariant.secondary => FilledButton(
          onPressed: isLoading ? null : onPressed,
          style: style.copyWith(padding: WidgetStatePropertyAll(padding)),
          child: child,
        ),
      Ba33ButtonVariant.outline => OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: style.copyWith(padding: WidgetStatePropertyAll(padding)),
          child: child,
        ),
      Ba33ButtonVariant.ghost => TextButton(
          onPressed: isLoading ? null : onPressed,
          style: style.copyWith(padding: WidgetStatePropertyAll(padding)),
          child: child,
        ),
    };

    return expand ? SizedBox(width: double.infinity, child: button) : button;
  }

  ButtonStyle _buildStyle(Ba33Colors colors) {
    return switch (variant) {
      Ba33ButtonVariant.primary => ElevatedButton.styleFrom(
          backgroundColor: colors.primary,
          foregroundColor: colors.primaryForeground,
          shape: RoundedRectangleBorder(borderRadius: Ba33Radii.borderRadiusLg),
        ),
      Ba33ButtonVariant.secondary => FilledButton.styleFrom(
          backgroundColor: colors.secondary,
          foregroundColor: colors.secondaryForeground,
          shape: RoundedRectangleBorder(borderRadius: Ba33Radii.borderRadiusLg),
        ),
      Ba33ButtonVariant.outline => OutlinedButton.styleFrom(
          foregroundColor: colors.foreground,
          side: BorderSide(color: colors.border),
          shape: RoundedRectangleBorder(borderRadius: Ba33Radii.borderRadiusLg),
        ),
      Ba33ButtonVariant.ghost => TextButton.styleFrom(
          foregroundColor: colors.foreground,
          shape: RoundedRectangleBorder(borderRadius: Ba33Radii.borderRadiusLg),
        ),
      Ba33ButtonVariant.destructive => ElevatedButton.styleFrom(
          backgroundColor: colors.destructive,
          foregroundColor: colors.destructiveForeground,
          shape: RoundedRectangleBorder(borderRadius: Ba33Radii.borderRadiusLg),
        ),
    };
  }

  EdgeInsets get _padding => switch (size) {
        Ba33ButtonSize.sm => const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        Ba33ButtonSize.md => const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        Ba33ButtonSize.lg => const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
      };

  TextStyle? _textStyle(BuildContext context) {
    final theme = Theme.of(context).textTheme;
    return switch (size) {
      Ba33ButtonSize.sm => theme.labelMedium,
      Ba33ButtonSize.md => theme.labelLarge,
      Ba33ButtonSize.lg => theme.labelLarge?.copyWith(fontSize: 16),
    };
  }
}
